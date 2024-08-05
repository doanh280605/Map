import { Redirect, Slot } from "expo-router";

import { useAuth } from "~/providers/AuthProvider";

export default function HomeLayout() {

    const { isAuthenticated } = useAuth();
    
    // If the user is not authenticated navigate them to the sign in screen
    if(!isAuthenticated) {
        return (
            <Redirect href="/auth" />
        )
    }

    return (
        <Slot />
    )
}