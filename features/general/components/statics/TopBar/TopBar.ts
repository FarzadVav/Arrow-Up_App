import TopBarBtn from "./TopBarBtn";
import TopBarGroup from "./TopBarGroup";
import TopBarRoot from "./TopBarRoot";
import TopBarTitle from "./TopBarTitle";

const TopBar = Object.assign(TopBarRoot, {
  Title: TopBarTitle,
  Btn: TopBarBtn,
  Group: TopBarGroup,
});

export default TopBar;
