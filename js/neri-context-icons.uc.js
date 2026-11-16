// ==UserScript==
// @name           neri-context-icons.uc.js
// @description    Adds MingCute icons to Neri's browser context menus
// @author         Rinne05
// @version        v1.0
// @include        main
// @grant          none
// ==/UserScript==

(function () {
  "use strict";

  const FLAG = "__neriContextIconsInstalled";
  if (document[FLAG]) return;
  document[FLAG] = true;

  /*
   * Only right-click menus are targeted. Submenus are recognized by walking
   * up to their top-level menupopup, so nested menus do not need their own
   * entry in this list.
   *
   * Deliberately excluded: the menu bar, the app menu, button menus such as
   * the sidebar switcher, the blocked-popup notification menu, and the
   * new-tab button menu.
   */
  const CONTEXT_ROOTS = new Set([
    "tabContextMenu",
    "contentAreaContextMenu",
    "toolbar-context-menu",
    "placesContext",
    "sidebar-context-menu",
    "sidebar-history-context-menu",
    "sidebar-synced-tabs-context-menu",
    "sidebar-opentabs-context-menu",
    "sidebar-bookmarks-context-menu",
    "pictureInPictureToggleContextMenu",
    "pageActionContextMenu",
    "unified-extensions-context-menu",
    "customizationPanelItemContextMenu",
    "customizationPaletteItemContextMenu",
    "downloadsContextMenu",
    "SyncedTabsSidebarContext",
    "SyncedTabsSidebarTabsFilterContext",
    "zenWorkspaceMoreActions",
    "zenFolderActions",
    "zenSiteDataActions",
    "open-tab-group-context-menu",
    "saved-tab-group-context-menu",
  ]);

  // Items whose native slot is already used for something else.
  const SKIP_IDS = new Set(["context-media-eme-learnmore"]);

  const ICON_GROUPS = {
    add: [
      "context_openANewTab",
      "placesContext_open:newtab",
      "placesContext_new:separator",
      "toolbar-context-openANewTab",
      "customizationPaletteItemContextMenuAddToToolbar",
      "sidebar-bookmarks-context-add-separator",
    ],
    ai: [
      "context_askChat",
      "context_askChatSummarize",
      "context_createAITab",
      "context-openlinksmartwindow",
      "context-ask-chat",
      "context-create-aitab",
    ],
    archive: [
      "context_unloadTab",
      "context_zenUnloadWorkspace",
      "context_zenUnloadAllOtherWorkspace",
      "context_zenFolderUnloadAll",
    ],
    bookmark_add: [
      "context-bookmarklink",
      "context_bookmarkTab",
      "context_bookmarkSelectedTabs",
      "placesContext_new:bookmark",
      "placesContext_createBookmark",
      "sidebar-history-context-bookmark-page",
      "sidebar-synced-tabs-context-bookmark-tab",
      "sidebar-bookmarks-context-add-bookmark",
      "syncedTabsBookmarkSelected",
      "toolbar-context-bookmarkSelectedTab",
      "toolbar-context-bookmarkSelectedTabs",
    ],
    book: [
      "spell-add-dictionaries-main",
      "spell-dictionaries",
      "spell-add-to-dictionary",
      "spell-undo-add-to-dictionary",
      "spell-add-dictionaries",
    ],
    bookmarks: [
      "placesContext_showAllBookmarks",
      "sidebar-bookmarks-context-open-all-bookmarks",
    ],
    devices: [
      "sidebar-synced-tabs-context-connect-another-device",
      "sidebar-opentabs-connect-another-device",
      "syncedTabsManageDevices",
    ],
    check: [
      "context_selectAllTabs",
      "toolbar-context-selectAllTabs",
    ],
    close: [
      "context_closeTab",
      "context_closeDuplicateTabs",
      "context_closeTabOptions",
      "context_closeTabsToTheStart",
      "context_closeTabsToTheEnd",
      "context_closeOtherTabs",
      "sidebar-context-menu-close-remote-tab",
      "sidebar-opentabs-context-close-tab",
      "toolbar-context-remove-from-toolbar",
      "customizationPanelItemContextMenuRemove",
    ],
    code: [
      "context-viewsource",
      "context-viewpartialsource-selection",
      "context-viewsource-goToLine",
      "context-viewsource-wrapLongLines",
      "context-viewsource-highlightSyntax",
      "context-inspect",
      "frame",
    ],
    container: [
      "context_reopenInContainer",
      "context-openlinkincontainertab",
      "context-openlinkinusercontext-menu",
      "placesContext_open:newcontainertab",
      "sidebar-history-context-menu-container-tab",
      "sidebar-synced-tabs-context-menu-container-tab",
      "sidebar-bookmarks-context-open-in-container-tab",
      "syncedTabsOpenSelectedInContainerTab",
      "context_zenWorkspacesOpenInContainerTab",
    ],
    copy: [
      "context_duplicateTab",
      "context_duplicateTabs",
      "context-copy",
      "context-copyimage-contents",
      "context-pdfjs-copy",
      "context-pdfjs-copy-page",
      "placesContext_copy",
      "sidebar-bookmarks-context-copy",
      "syncedTabsCopySelected",
    ],
    cut: [
      "context-cut",
      "context-pdfjs-cut",
      "context-pdfjs-cut-page",
      "placesContext_cut",
      "sidebar-bookmarks-context-cut",
    ],
    delete: [
      "context-delete",
      "context-pdfjs-delete",
      "context-pdfjs-delete-page",
      "context-remove-highlight",
      "placesContext_deleteBookmark",
      "placesContext_deleteFolder",
      "placesContext_delete",
      "placesContext_delete_history",
      "placesContext_deleteHost",
      "sidebar-history-context-delete-page",
      "sidebar-history-context-forget-site",
      "sidebar-history-context-delete-pages",
      "sidebar-bookmarks-context-delete-bookmark",
      "toolbar-context-remove-extension",
      "sidebar-context-menu-remove-extension",
      "customizationPanelItemContextMenuRemoveExtension",
      "unified-extensions-context-menu-remove-extension",
      "pageActionContextMenuRemoveExtension",
      "context_zenDeleteWorkspace",
      "context_zenFolderDelete",
      "context_zenClearSiteData",
      "open-tab-group-context-menu_delete",
      "saved-tab-group-context-menu_delete",
    ],
    down: [
      "context_moveToEnd",
      "unified-extensions-context-menu-move-widget-down",
    ],
    download: [
      "context-savelink",
      "context-saveimage",
      "context-savevideo",
      "context-saveaudio",
      "context-savepage",
      "context-pdfjs-save-page",
      "toolbar-context-autohide-downloads-button",
      "toolbar-context-always-open-downloads-panel",
    ],
    edit: [
      "sidebar-bookmarks-context-edit-bookmark",
      "context_zenEditWorkspace",
      "context_zenFolderRename",
    ],
    external: [
      "context-openlinkintab",
      "context-viewvideo",
      "context-viewimage",
      "placesContext_open",
      "placesContext_openBookmarkContainer:tabs",
      "placesContext_openBookmarkLinks:tabs",
      "placesContext_openContainer:tabs",
      "placesContext_openLinks:tabs",
      "sidebar-history-context-open-in-tab",
      "sidebar-history-context-open-all-in-tabs",
      "sidebar-synced-tabs-context-open-in-tab",
      "sidebar-synced-tabs-context-open-all-in-tabs",
      "sidebar-bookmarks-context-open-in-tab",
      "syncedTabsOpenSelected",
      "syncedTabsOpenSelectedInTab",
      "syncedTabsOpenAllInTabs",
    ],
    eye: [
      "context-previewlink",
      "context-media-showcontrols",
      "context-reveal-password",
      "context-inspect-a11y",
    ],
    eye_off: [
      "context-media-hidecontrols",
      "sidebar-context-menu-hide-sidebar",
      "context_HidePictureInPictureToggle",
    ],
    folder: [
      "placesContext_showInFolder",
      "sidebar-bookmarks-context-show-in-folder",
    ],
    folder_add: [
      "placesContext_new:folder",
      "sidebar-bookmarks-context-add-folder",
      "context_zenFolderNewSubfolder",
    ],
    folder_open: ["context_zenFolderUnpack"],
    folder_remove: ["context_ungroupTab", "context_ungroupSplitView"],
    fullscreen: ["context-video-fullscreen"],
    fullscreen_exit: [
      "context-leave-dom-fullscreen",
      "context_fullscreenExit",
      "toolbar-context-full-screen-exit",
    ],
    grid: [
      "toolbar-context-always-show-extensions-button",
      "context_zenOpenGetAddons",
    ],
    group: [
      "context_moveTabToNewGroup",
      "context_moveSplitViewToNewGroup",
      "context_moveTabToGroup",
      "context_moveTabToGroupNewGroup",
      "context_moveTabToSavedGroup",
    ],
    history: ["context_undoCloseTab", "toolbar-context-undoCloseTab"],
    image: ["context_zenEditWorkspaceIcon", "context_zenFolderChangeIcon"],
    info: [
      "context-viewimageinfo",
      "context-viewimagedesc",
      "placesContext_show:info",
      "placesContext_show_bookmark:info",
      "placesContext_show_folder:info",
    ],
    link: [
      "context-openlinkincurrent",
      "context-copylink",
      "context-copyimage",
      "context-copyvideourl",
      "context-copyaudiourl",
      "context-copy-link-to-highlight",
      "context-copy-clean-link-to-highlight",
      "sidebar-history-context-copy-link",
      "sidebar-synced-tabs-context-copy-link",
      "sidebar-opentabs-context-copy-link",
      "sidebar-bookmarks-context-copy-link",
    ],
    mail: ["context-copyemail"],
    monitor: ["context-setDesktopBackground"],
    move: [
      "context_moveTabOptions",
      "context_reverseSplitView",
      "context_zenChangeFolderSpace",
      "context_zenFolderToSpace",
      "toolbar-context-move-to-panel",
      "customizationPaletteItemContextMenuAddToPanel",
      "context_MovePictureInPictureToggle",
    ],
    mute: [
      "context_toggleMuteTab",
      "context_toggleMuteSelectedTabs",
      "context-media-mute",
    ],
    note: [
      "context_addNote",
      "context_editNote",
      "context-pdfjs-comment-selection",
    ],
    palette: ["context_zenChangeWorkspaceTheme"],
    paste: [
      "context-paste",
      "context-paste-no-formatting",
      "context-pdfjs-paste",
      "placesContext_paste",
      "placesContext_paste_group",
      "sidebar-bookmarks-context-paste",
    ],
    pause: ["context-media-pause"],
    phone: ["context-copyphone"],
    pin: [
      "context_pinTab",
      "context_pinSelectedTabs",
      "toolbar-context-pin-to-toolbar",
      "customizationPanelItemContextMenuPin",
      "unified-extensions-context-menu-pin-to-toolbar",
    ],
    pip: [
      "context-video-pictureinpicture",
      "context_openTabInMiniWindow",
      "context-use-mini-window",
    ],
    play: [
      "context_playTab",
      "context_playSelectedTabs",
      "context-media-play",
    ],
    print: ["context-print-selection"],
    private: [
      "context-openlinkprivate",
      "placesContext_open:newprivatewindow",
      "sidebar-history-context-open-in-private-window",
      "sidebar-synced-tabs-context-open-in-private-window",
      "sidebar-opentabs-context-open-in-private-window",
      "sidebar-bookmarks-context-open-in-private-window",
      "syncedTabsOpenSelectedInPrivateWindow",
    ],
    redo: ["context-redo", "context-pdfjs-redo"],
    refresh: [
      "context_reloadTab",
      "context_reloadSelectedTabs",
      "context-reloadimage",
      "toolbar-context-reloadSelectedTab",
      "toolbar-context-reloadSelectedTabs",
      "syncedTabsRefresh",
      "syncedTabsRefreshFilter",
    ],
    screenshot: ["context-take-screenshot", "context-video-saveimage"],
    search: [
      "context-add-engine",
      "context-searchselect",
      "context-searchselect-private",
      "context-visual-search",
    ],
    send: [
      "context_sendTabToDevice",
      "context-sendlinktodevice",
      "context-sendpagetodevice",
      "context-sendimage",
      "context-sendvideo",
      "context-sendaudio",
    ],
    settings: [
      "context_zenManageWorkspaces",
      "context_zenSpaceRoutingSettings",
      "context_zenLiveFolderOptions",
      "context_zenOpenSiteSettings",
      "toolbar-context-manage-extension",
      "toolbar-context-customize-sidebar",
      "toolbar-context-customize",
      "sidebar-context-menu-manage-extension",
      "sidebar-context-menu-customize-sidebar",
      "customizationPanelItemContextMenuManageExtension",
      "unified-extensions-context-menu-manage-extension",
      "pageActionContextMenuManageExtension",
      "sidebar-synced-tabs-context-manage-this-device",
    ],
    share: [
      "context_shareSelectedTabs",
      "context-stripOnShareLink",
      "open-tab-group-context-menu_share",
      "contentsharing_sharefolder",
      "context_zenShareWorkspace",
      "context_zenShareFolder",
    ],
    sidebar: [
      "sidebar-context-menu-enable-vertical-tabs",
      "toolbar-context-toggle-vertical-tabs",
    ],
    sort: [
      "placesContext_sortBy:name",
      "sidebar-bookmarks-context-sort-by-name",
    ],
    speed: ["context-media-playbackrate"],
    split: [
      "context_moveTabToSplitView",
      "context_separateSplitView",
      "context-openlinkinsplitview",
    ],
    tag: ["placesContext_removeTag"],
    text: [
      "context-bidi-text-direction-toggle",
      "context-bidi-page-direction-toggle",
      "context-imagetext",
      "context-pdfjs-highlight-selection",
    ],
    translate: ["context-translate-selection"],
    undo: ["context-undo", "context-pdfjs-undo"],
    unmute: ["context-media-unmute"],
    unpin: [
      "context_unpinTab",
      "context_unpinSelectedTabs",
      "sidebar-context-menu-unpin-extension",
      "customizationPanelItemContextMenuUnpin",
    ],
    up: [
      "context_moveToStart",
      "unified-extensions-context-menu-move-widget-up",
    ],
    warning: [
      "sidebar-context-menu-report-extension",
      "toolbar-context-report-extension",
      "customizationPanelItemContextMenuReportExtension",
      "unified-extensions-context-menu-report-extension",
    ],
    window: [
      "context_openTabInWindow",
      "context-openlink",
      "placesContext_open:newwindow",
      "sidebar-history-context-open-in-window",
      "sidebar-synced-tabs-context-open-in-window",
      "sidebar-opentabs-context-open-in-window",
      "sidebar-bookmarks-context-open-in-window",
      "syncedTabsOpenSelectedInWindow",
      "open-tab-group-context-menu_moveToThisWindow",
      "open-tab-group-context-menu_moveToNewWindow",
      "saved-tab-group-context-menu_openInThisWindow",
      "saved-tab-group-context-menu_openInNewWindow",
    ],
  };

  const COMMAND_GROUPS = {
    add: ["cmd_newNavigatorTab", "cmd_zenOpenWorkspaceCreation"],
    bookmark_add: ["placesCmd_new:bookmark", "placesCmd_createBookmark"],
    bookmarks: ["Browser:ShowAllBookmarks"],
    check: ["cmd_selectAll"],
    close: ["cmd_close", "cmd_closeWindow", "splitViewCmd_closeTabs"],
    container: ["Browser:AddContainer", "Browser:OpenAboutContainers"],
    copy: ["cmd_copy", "placesCmd_copy"],
    cut: ["cmd_cut", "placesCmd_cut"],
    delete: ["cmd_delete", "placesCmd_delete"],
    download: ["Browser:SavePage"],
    external: [
      "placesCmd_open",
      "placesCmd_open:tab",
      "downloadsCmd_openInSystemViewer",
      "downloadsCmd_openReferrer",
    ],
    folder: ["placesCmd_showInFolder", "downloadsCmd_show"],
    folder_add: ["placesCmd_new:folder", "cmd_zenOpenFolderCreation"],
    folder_open: ["Browser:OpenFile"],
    grid: ["Tools:Addons"],
    history: ["History:UndoCloseTab"],
    info: ["placesCmd_show:info"],
    link: ["downloadsCmd_copyLocation"],
    palette: ["cmd_zenOpenZenThemePicker"],
    paste: ["cmd_paste", "cmd_pasteNoFormatting", "placesCmd_paste"],
    private: ["Tools:PrivateBrowsing", "placesCmd_open:privatewindow"],
    redo: ["cmd_redo"],
    search: ["Browser:OpenLocation"],
    send: ["Browser:SendLink"],
    settings: [
      "cmd_zenManageWorkspaces",
      "cmd_zenOpenSpaceRoutingSettings",
      "cmd_CustomizeToolbars",
    ],
    sort: ["placesCmd_sortBy:name"],
    split: [
      "splitViewCmd_separateTabs",
      "splitViewCmd_reverseTabs",
      "cmd_zenNewEmptySplit",
    ],
    undo: ["cmd_undo"],
    window: ["cmd_newNavigator", "placesCmd_open:window"],
  };

  const L10N_GROUPS = {
    check: [
      "text-action-select-all",
      "downloads-cmd-unblock",
      "downloads-cmd-always-use-system-default",
      "downloads-cmd-always-open-similar-files",
    ],
    book: [
      "text-action-spell-add-dictionaries",
      "text-action-spell-dictionaries",
      "text-action-spell-add-to-dictionary",
      "text-action-spell-undo-add-to-dictionary",
    ],
    copy: ["text-action-copy"],
    cut: ["text-action-cut"],
    delete: [
      "text-action-delete",
      "downloads-cmd-delete-file",
      "downloads-cmd-remove-from-history",
      "downloads-cmd-clear-list",
      "downloads-cmd-clear-downloads",
    ],
    external: [
      "downloads-cmd-use-system-default",
      "downloads-cmd-go-to-download-page",
    ],
    folder: ["downloads-cmd-show-menuitem-2"],
    link: ["downloads-cmd-copy-download-link"],
    paste: ["text-action-paste", "text-action-paste-no-formatting"],
    pause: ["downloads-cmd-pause"],
    play: ["downloads-cmd-resume"],
    redo: ["text-action-redo"],
    undo: ["text-action-undo"],
  };

  const byId = new Map();
  const byCommand = new Map();
  const byL10n = new Map();

  function indexGroups(target, groups) {
    for (const [icon, keys] of Object.entries(groups)) {
      for (const key of keys) target.set(key, icon);
    }
  }

  indexGroups(byId, ICON_GROUPS);
  indexGroups(byCommand, COMMAND_GROUPS);
  indexGroups(byL10n, L10N_GROUPS);

  function topLevelPopup(popup) {
    let root = popup;
    for (let node = popup.parentNode; node; node = node.parentNode) {
      if (node.localName === "menupopup") root = node;
    }
    return root;
  }

  function resolveIcon(item) {
    // This item changes between "Mute Tab" and "Unmute Tab" per opening.
    if (
      item.id === "context_toggleMuteTab" ||
      item.id === "context_toggleMuteSelectedTabs"
    ) {
      return item.hasAttribute("muted") ? "unmute" : "mute";
    }

    let icon = byId.get(item.id);
    if (icon) return icon;

    const command = item.getAttribute("command");
    if (command) {
      icon = byCommand.get(command);
      if (icon) return icon;
    }

    const l10n =
      item.getAttribute("data-l10n-id") ||
      item.getAttribute("data-lazy-l10n-id");
    if (l10n) {
      icon = byL10n.get(l10n);
      if (icon) return icon;
    }

    return null;
  }

  function* menuItems(node) {
    for (const child of node.children) {
      if (child.localName === "menuitem" || child.localName === "menu") {
        yield child;
      } else if (child.localName === "menugroup") {
        yield* menuItems(child);
      }
    }
  }

  function hasNativeIcon(item) {
    return (
      item.hasAttribute("image") ||
      item.classList.contains("menuitem-iconic") ||
      item.classList.contains("menu-iconic")
    );
  }

  function applyIcons(popup) {
    let applied = 0;

    for (const item of menuItems(popup)) {
      if (item.localName !== "menuitem" && item.localName !== "menu") continue;

      const current = item.getAttribute("data-neri-icon");
      if (!current && hasNativeIcon(item)) continue;
      if (item.matches('[type="checkbox"], [type="radio"]')) continue;
      if (SKIP_IDS.has(item.id)) continue;
      if (item.closest("#context-navigation")) continue;
      if (item.closest("[data-extensionid]")) continue;

      const icon = resolveIcon(item);
      if (!icon) {
        if (current) {
          item.removeAttribute("data-neri-icon");
          item.classList.remove("menuitem-iconic", "menu-iconic");
        }
        continue;
      }

      if (current !== icon) item.setAttribute("data-neri-icon", icon);
      item.classList.add(
        item.localName === "menu" ? "menu-iconic" : "menuitem-iconic"
      );
      applied++;
    }

    if (applied) popup.setAttribute("needsgutter", "always");
  }

  document.addEventListener(
    "popupshowing",
    (event) => {
      const popup = event.target;
      if (popup?.localName !== "menupopup") return;
      if (!CONTEXT_ROOTS.has(topLevelPopup(popup).id)) return;
      applyIcons(popup);
    },
    false
  );
})();
