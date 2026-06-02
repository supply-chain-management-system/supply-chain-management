import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { fetchMe } from "./authslice";

const AuthProvider = ({ children }) => {

  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {

    if (initialized.current) return;

    initialized.current = true;

    dispatch(fetchMe());

    // Setup periodic real-time session validation checks
    const interval = setInterval(() => {
      dispatch(fetchMe());
    }, 10000);

    return () => clearInterval(interval);

  }, [dispatch]);

  return children;
};

export default AuthProvider;