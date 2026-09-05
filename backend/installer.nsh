!include nsDialogs.nsh
!include LogicLib.nsh

!ifndef BUILD_UNINSTALLER

Var ShortcutsPage
Var CheckboxDesktop
Var CheckboxStartMenu
Var CheckboxDesktop_State
Var CheckboxStartMenu_State

!macro customPageAfterChangeDir
  Page custom ShortcutsPageCreate ShortcutsPageLeave
!macroend

Function ShortcutsPageCreate

  nsDialogs::Create 1018
  Pop $ShortcutsPage
  ${If} $ShortcutsPage == error
    Abort
  ${EndIf}

  ${NSD_CreateCheckbox} 0 10u 100% 10u "Tao loi tat tren man hinh chinh (Desktop)"
  Pop $CheckboxDesktop
  ${NSD_SetState} $CheckboxDesktop ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 30u 100% 10u "Tao loi tat tren thanh menu (Start Menu)"
  Pop $CheckboxStartMenu
  ${NSD_SetState} $CheckboxStartMenu ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function ShortcutsPageLeave
  ${NSD_GetState} $CheckboxDesktop $CheckboxDesktop_State
  ${NSD_GetState} $CheckboxStartMenu $CheckboxStartMenu_State
FunctionEnd

!macro customInstall
  ${If} $CheckboxDesktop_State == ${BST_UNCHECKED}
    Delete "$newDesktopLink"
  ${EndIf}

  ${If} $CheckboxStartMenu_State == ${BST_UNCHECKED}
    Delete "$newStartMenuLink"
  ${EndIf}
!macroend

!endif
