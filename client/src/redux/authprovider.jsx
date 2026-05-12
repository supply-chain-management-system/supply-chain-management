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

  }, [dispatch]);

  return children;
};

export default AuthProvider;