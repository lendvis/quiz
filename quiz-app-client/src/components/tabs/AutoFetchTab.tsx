import { WithApi, type WithApiProps } from "../withApi"
import { TabErrorFallback } from "../common/fallbacks/TabErrorFallback"
import { Tab } from "./Tab"

export interface AutoFetchTab<T> extends WithApiProps<T> {

}

export const AutoFetchTab = <T,>(
  props: AutoFetchTab<T>
) => {
  return (
    <Tab>
      <WithApi<T>
        response={props.response}
        fallback={<TabErrorFallback />}
      >
        {props.children}
      </WithApi>
    </Tab>
  );
};
