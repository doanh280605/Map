import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { useRide } from "~/providers/RideProvider";
import { Text } from 'react-native'
import { Button } from './Button'
 
export default function ActiveRideSheet() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { ride, finishRide } = useRide();

    useEffect(() => {
        if(ride) {
            bottomSheetRef.current?.expand();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [ride])

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={[200]}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#41442'}}
        >
            {ride && (
                <BottomSheetView style={{flex: 1, padding: 10, gap: 20}}>
                    <Text>Ride in progress</Text>
                    
                    <Button 
                        title="Finish ride"
                        onPress={() => finishRide()}
                    />
                </BottomSheetView>
            )}
        </BottomSheet>
    )
}