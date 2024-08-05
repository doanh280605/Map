import { Redirect, Slot } from 'expo-router';

import { useAuth } from '~/providers/AuthProvider';

export default function AuthLayout() {
    const { isAuthenticated } = useAuth();

    // If the user is authenticated then we will navigate them to the homescreen
    if(isAuthenticated) {
        return (
            <Redirect href='/' />
        )
    }

    return (
        <Slot />
    )
}