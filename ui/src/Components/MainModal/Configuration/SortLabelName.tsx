import React, { FC } from "react";

import Creatable from "react-select/creatable";

import { StaticLabels } from "Common/Query";
import { OptionT } from "Common/Select";
import { FormatBackendURI } from "Stores/AlertStore";
import { Settings } from "Stores/Settings";
import { useFetchGet } from "Hooks/useFetchGet";
import { ThemeContext } from "Components/Theme";
import { NewLabelName, StringToOption } from "Common/Select";

const SortLabelName: FC<{
  settingsStore: Settings;
}> = ({ settingsStore }) => {
  const { response } = useFetchGet(FormatBackendURI(`labelNames.json`));

  if (!settingsStore.gridConfig.config.sortLabel) {
    settingsStore.gridConfig.config.sortLabel = StaticLabels.AlertName;
  }

  const context = React.useContext(ThemeContext);

  return (
    <Creatable
      styles={context.reactSelectStyles}
      classNamePrefix="react-select"
      instanceId="configuration-sort-label"
      formatCreateLabel={NewLabelName}
      defaultValue={StringToOption(settingsStore.gridConfig.config.sortLabel)}
      options={
        response ? response.map((value: string) => StringToOption(value)) : []
      }
      onChange={(option) => {
        settingsStore.gridConfig.config.sortLabel = (option as OptionT)
          .value as string;
      }}
    />
  );
};

export { SortLabelName };
