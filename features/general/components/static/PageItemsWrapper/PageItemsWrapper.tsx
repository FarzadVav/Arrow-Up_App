import { PropsWithChildren } from "react";

function PageItemsWrapper(p: PropsWithChildren) {
  return (
    <div
      className="w-full flex flex-col justify-start items-start flex-1 gap-md"
      {...p}
    />
  );
}

export default PageItemsWrapper;
