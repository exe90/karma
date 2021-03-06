import React, { FC, useEffect, ReactNode, ComponentType } from "react";

import { observer } from "mobx-react-lite";

import {
  components,
  PlaceholderProps,
  ValueContainerProps,
} from "react-select";

import Creatable from "react-select/creatable";

import { FormatBackendURI } from "Stores/AlertStore";
import { SilenceFormStore, MatcherWithIDT } from "Stores/SilenceFormStore";
import { useFetchGet } from "Hooks/useFetchGet";
import { hashObject } from "Common/Hash";
import { NewLabelValue, OptionT, StringToOption } from "Common/Select";
import { ValidationError } from "Components/ValidationError";
import { ThemeContext } from "Components/Theme";
import { MatchCounter } from "./MatchCounter";

const GenerateHashFromMatchers = (
  silenceFormStore: SilenceFormStore,
  matcher: MatcherWithIDT
): number =>
  hashObject({
    alertmanagers: silenceFormStore.data.alertmanagers,
    matcher: {
      name: matcher.name,
      values: matcher.values,
      isRegex: matcher.isRegex,
    },
  });

const Placeholder: FC = (props) => {
  return (
    <div>
      <components.Placeholder {...(props as PlaceholderProps<any>)} />
    </div>
  );
};

const ValueContainer: FC<{
  selectProps: {
    silenceFormStore: SilenceFormStore;
    matcher: MatcherWithIDT;
  };
  props: ValueContainerProps<any>;
  children: ReactNode;
}> = ({ children, selectProps, ...props }) => (
  <components.ValueContainer {...(props as any)}>
    {selectProps.matcher.values.length > 0 ? (
      <MatchCounter
        key={GenerateHashFromMatchers(
          selectProps.silenceFormStore,
          selectProps.matcher
        )}
        silenceFormStore={selectProps.silenceFormStore}
        matcher={selectProps.matcher}
      />
    ) : null}
    {children}
  </components.ValueContainer>
);

const LabelValueInput: FC<{
  silenceFormStore: SilenceFormStore;
  matcher: MatcherWithIDT;
  isValid: boolean;
}> = observer(({ silenceFormStore, matcher, isValid }) => {
  const { response, get, cancelGet } = useFetchGet(
    FormatBackendURI(`labelValues.json?name=${matcher.name}`),
    { autorun: false }
  );

  useEffect(() => {
    if (matcher.name) {
      get();
    }
    return () => cancelGet();
  }, [matcher.name, get, cancelGet]);

  const context = React.useContext(ThemeContext);

  return (
    <Creatable
      styles={context.reactSelectStyles}
      classNamePrefix="react-select"
      instanceId={`silence-input-label-value-${matcher.id}`}
      formatCreateLabel={NewLabelValue}
      defaultValue={matcher.values}
      options={
        response ? response.map((value: string) => StringToOption(value)) : []
      }
      placeholder={isValid ? "Label value" : <ValidationError />}
      onChange={(newValue) => {
        matcher.values = (newValue || []) as OptionT[];
        // force regex if we have multiple values
        if (matcher.values.length > 1 && matcher.isRegex === false) {
          matcher.isRegex = true;
        } else if (matcher.values.length === 1 && matcher.isRegex === true) {
          matcher.isRegex = false;
        }
      }}
      hideSelectedOptions
      isMulti
      components={{
        ValueContainer: ValueContainer as ComponentType<any>,
        Placeholder: Placeholder,
      }}
      silenceFormStore={silenceFormStore}
      matcher={matcher}
    />
  );
});

export { LabelValueInput };
