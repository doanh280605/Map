import { PropsWithChildren, createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "~/lib/supabase";
import { useAuth } from "./AuthProvider";
import { fetchDirectionBaseOnCoords } from "~/services/direction";
import * as Location from 'expo-location'

const RideContext = createContext({});

export default function RideProvider({children}: PropsWithChildren) {
    const [ride, setRide] = useState();
    const [rideRoute, setRideRoute] = useState([])
    const { userId } = useAuth();

    useEffect(() => {
        const fetchActiveRide = async () => {
            const { data, error } = await supabase
                .from('rides')
                .select('*')
                .eq('user_id', userId)
                .is('finished_at', null)
                .limit(1)
                .single();
            if(data){
                setRide(data);
            }
        }

        fetchActiveRide();
    }, [])

    useEffect(() => {
        let subscription: Location.LocationSubscription | undefined;
    
        const watchLocation = async () => {
          subscription = await Location.watchPositionAsync({ distanceInterval: 30 }, (newLocation) => {
            console.log('New location: ', newLocation.coords.longitude, newLocation.coords.latitude);
            setRideRoute((currrRoute) => [
              ...currrRoute,
              [newLocation.coords.longitude, newLocation.coords.latitude],
            ]);
          });
        };
    
        if (ride) {
          watchLocation();
        }
    
        // unsubscribe
        return () => {
          subscription?.remove();
        };
      }, [ride]);
    

    const startRide = async (scooterId: number) => {
        if(ride) {
            Alert.alert('Cannot start a new ride while another is in progress')
            return;
        }
        const { data, error } = await supabase
          .from('rides')
          .insert([{
            user_id: userId,
            scooter_id: scooterId,
          }])
          .select();
        if(error){
          Alert.alert('Failed to start the ride')
        } else {
          setRide(data[0])
        }
    }

    const finishRide = async () => {
        if(!ride){
            return;
        }

        const actualRoute = await fetchDirectionBaseOnCoords(rideRoute);
        const rideRouteCoords = actualRoute.matchings[0].geometry.coordinates;
        const rideRouteDuration = actualRoute.matchings[0].duration;
        const rideRouteDistance = actualRoute.matchings[0].distance;
        setRideRoute(actualRoute.matchings[0].geometry.coordinates)
    
        const { error } = await supabase
            .from('rides')
            .update({ 
                finished_at: new Date() ,
                routeDuration: rideRouteDuration,
                routeDistance: rideRouteDistance,
                routeCoords: rideRouteCoords
            })
            .eq('id', ride.id)

        if(error){
            Alert.alert('Failed to finish ride')
        } else {
            setRide(undefined)
        }
    }

    return (
        <RideContext.Provider value={{ startRide, ride, finishRide, rideRoute }}>{children}</RideContext.Provider>
    )
}

export const useRide = () => useContext(RideContext);