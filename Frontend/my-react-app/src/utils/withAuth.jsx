import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const [isChecking, setIsChecking] = useState(true);

        useEffect(() => {
            if (!localStorage.getItem("token")) {
                router("/auth");
            } else {
                setIsChecking(false);
            }
        }, [router]);

        if (isChecking) {
            return null;
        }

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;