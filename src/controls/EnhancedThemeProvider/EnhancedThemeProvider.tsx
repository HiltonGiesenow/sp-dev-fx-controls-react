import { ThemeProvider } from '@fluentui/react-theme-provider';
import { getVariant, VariantThemeType } from "@fluentui/scheme-utilities";
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { createTheme, getTheme, ITheme } from "office-ui-fabric-react/lib/Styling";
import * as React from "react";
import { useCallback, useEffect, useState } from 'react';
import { fluentUITeamsDarkTheme } from '../../common/fluentUIThemes/FluentUITeamsDarkTheme';
import { fluentUITeamsDefaultTheme } from '../../common/fluentUIThemes/FluentUITeamsDefaultTheme';
import { fluentUITeamsHighContrastTheme } from '../../common/fluentUIThemes/FluentUITeamsHighContrastTheme';
import { IEnhancedThemeProviderProps } from './IEnhancedThemeProviderProps';
import { ThemeContext, useTheme } from '@fluentui/react-theme-provider';
import * as telemetry from '../../common/telemetry';

const getDefaultTheme = (): ITheme => {
  let currentTheme;
  const themeColorsFromWindow: any = (window as any)?.__themeState__?.theme;
  if (themeColorsFromWindow) {
    currentTheme = createTheme({
      palette: themeColorsFromWindow
    });
  }
  else {
    currentTheme = getTheme();
  }

  return currentTheme;
};

const EnhancedThemeProvider = (props: IEnhancedThemeProviderProps) => {

  const [isInTeams, setIsInTeams] = useState(false);
  const [teamsThemeName, setTeamsThemeName] = useState<string>(null);

  // track the telemetry as 'ReactEnhancedThemeProvider'
  useEffect(() => {
    telemetry.track('ReactEnhancedThemeProvider');
  }, []);
  // *****

  useEffect(() => {
    initializeIcons();
  }, []);

  useEffect(() => {
    setIsInTeams((props.context.sdks.microsoftTeams) ? true : false);
  }, [props.context]);

  useEffect(() => {
    if (isInTeams) {
      setTeamsThemeName(props.context.sdks.microsoftTeams?.context?.theme);
      props.context.sdks?.microsoftTeams?.teamsJs?.registerOnThemeChangeHandler((theme: string) => {
        setTeamsThemeName(theme);
      });
    }
  }, [props.context, isInTeams]);

  const themeToApply = useCallback(
    () => {
      let workingTheme: ITheme;

      if (isInTeams) {
        switch (teamsThemeName) {
          case "default": workingTheme = fluentUITeamsDefaultTheme;
            break;
          case "dark": workingTheme = fluentUITeamsDarkTheme;
            break;
          case "contrast": workingTheme = fluentUITeamsHighContrastTheme;
            break;
          default: workingTheme = fluentUITeamsDefaultTheme;
            break;
        }
      } else if (props.theme) {
        workingTheme = getVariant(props.theme, VariantThemeType.None);
      } else {
        workingTheme = getDefaultTheme();
      }

      return workingTheme;
    },
    [props.theme, teamsThemeName]);

  return (
    <ThemeProvider
      {...props}
      theme={themeToApply()}>
      {props.children}
    </ThemeProvider>
  );
};

export { EnhancedThemeProvider, getDefaultTheme, useTheme, ThemeContext };
