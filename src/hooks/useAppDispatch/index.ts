import { useDispatch } from "react-redux";
import { AppDispatch } from "src/types";

const useAppDispatch = () => useDispatch<AppDispatch>();
export default useAppDispatch;
