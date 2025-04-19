import { lazy, Suspense, useEffect, useState } from 'react';
import { MicromoleculesEditor, EditorProps } from './MicromoleculesEditor';
import { ModeControl } from './script/ui/views/toolbars/ModeControl';
import { LoadingCircles } from './script/ui/views/components';
import { LeftPanController } from './LeftPanController';

import styles from './Editor.module.less';

type Props = EditorProps & {
  disableMacromoleculesEditor?: boolean;
  leftPanController?: LeftPanController;
};

/*
 * TODO:
 *  ketcher-macromolecules is imported asynchronously to avoid circular dependencies between it and ketcher-react
 *  and ts-ignore is needed to avoid TypeScript error as ketcher-react is built first
 *  so ketcher-macromolecules can't provide any typings while building ketcher-react.
 *  Consider refactoring/restructuring packages to avoid these two issues
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MacromoleculesEditor = lazy(() => import('ketcher-macromolecules'));

export const Editor = (props: Props) => {
  const [showPolymerEditor, setShowPolymerEditor] = useState(false);

  const togglePolymerEditor = (toggleValue: boolean) => {
    setShowPolymerEditor(toggleValue);
    window.isPolymerEditorTurnedOn = toggleValue;
  };

  // Default leftPanController if not provided
  const defaultLeftPanController: LeftPanController = {
    minimizeLeftPan: () => {
      console.log(
        'LeftPanController is uninitialized - minimizeLeftPan() was called but not defined',
      );
    },
  };

  // Use the provided leftPanController or fallback to the default one
  const leftPanController = props.leftPanController || defaultLeftPanController;

  const togglerComponent = !props.disableMacromoleculesEditor ? (
    <ModeControl
      toggle={togglePolymerEditor}
      isPolymerEditor={showPolymerEditor}
    />
  ) : undefined;

  useEffect(() => {
    return () => {
      window.isPolymerEditorTurnedOn = false;
    };
  }, []);

  return (
    <>
      {showPolymerEditor ? (
        <Suspense
          fallback={
            <div className={styles.switchingLoader}>
              <LoadingCircles />
            </div>
          }
        >
          <MacromoleculesEditor togglerComponent={togglerComponent} />
        </Suspense>
      ) : (
        <Suspense
          fallback={
            <div className={styles.switchingLoader}>
              <LoadingCircles />
            </div>
          }
        >
          <MicromoleculesEditor
            {...props}
            togglerComponent={togglerComponent}
            leftPanController={leftPanController}
          />
        </Suspense>
      )}
    </>
  );
};
