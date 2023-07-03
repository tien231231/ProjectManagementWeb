import { useAppDispatch, useAppSelector } from "../redux/hook";
import { setQuery } from "../redux/slice/paramsSlice";

export const useSortPrio = () => {
  const queryParams = useAppSelector((state: any) => state.queryParams);
  const dispatch = useAppDispatch();
  return (asc: string, desc: string) => {
    let sortValue = queryParams.taskTableParams.sort;
    if (sortValue === asc) {
      dispatch(
        setQuery({
          ...queryParams,
          taskTableParams: { ...queryParams.taskTableParams, sort: desc },
        })
      );
      return;
    } else if (sortValue === desc) {
      dispatch(
        setQuery({
          ...queryParams,
          taskTableParams: { ...queryParams.taskTableParams, sort: asc },
        })
      );
      return;
    } else {
      dispatch(
        setQuery({
          ...queryParams,
          taskTableParams: { ...queryParams.taskTableParams, sort: desc },
        })
      );
      return;
    }
  };
};
