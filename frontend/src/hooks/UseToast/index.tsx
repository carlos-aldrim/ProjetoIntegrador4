import { toast } from "react-toastify";
import { useCallback } from "react";
import {
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from "react-icons/fi";

export const useToast = () => {
  const handleToast = useCallback((
    message = "Houve um erro, tente novamente",
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    const toastTypes = {
      info: toast.info,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
    };

    const icons = {
      info: <FiInfo />,
      success: <FiCheckCircle />,
      error: <FiXCircle />,
      warning: <FiAlertTriangle />,
    };

    const showToast = toastTypes[type];
    const icon = icons[type];

    showToast(message, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      icon: icon,
      style: {
        fontFamily: "sans-serif",
      },
    });
  }, []);

  return {
    handleToast,
  };
};
