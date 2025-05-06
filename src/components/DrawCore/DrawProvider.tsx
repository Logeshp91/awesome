import { DrawContext } from './DrawContext';
import React, {
  ReactElement,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { Action, DrawItem, DrawState, hslColor,  } from '../../types';
import { useSharedValue } from 'react-native-reanimated';
import type ViewShot from 'react-native-view-shot';
import { Keyboard } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const myData: any = [
{
  type:"polygon",
  strokeWidth:2,
  color:"hsl(56, 85.70%, 49.20%)",
  data:{
    points: "100,100 200,100 200,200 100,200 50,50"
  }
},
{
  type:"rectangle",
  strokeWidth:2,
  color:"hsl(141, 85.70%, 49.20%)",
  data:{
    x:200,
    y:200,
    width:100,
    height:100
  }
}

]

const initialState: DrawState = {
  doneItems: [...myData],
  screenStates: [[]],
  cancelEnabled: false,
  drawingMode: 'pen',
};

const reducerDrawStates = (drawState: DrawState, action: Action): DrawState => {
  'worklet';
  switch (action.type) {
    case 'SET_CANCEL_ENABLED':
      return {
        ...drawState,
        cancelEnabled: action.cancelEnabled,
      };
    case 'SET_DRAWING_MODE':
      Keyboard.dismiss();
      return {
        ...drawState,
        drawingMode: action.drawingMode,
      };
    case 'ADD_DONE_ITEM':
      console.log("ADD DONE ITEMS", JSON.stringify(action.item));
      return {
        ...drawState,
        doneItems: drawState.doneItems.concat(action.item),
      };
    case 'DELETE_DONE_ITEM':
      const newDoneItems = drawState.doneItems.filter((_, index) => index !== action.indice);
      return {
        ...drawState,
        doneItems: newDoneItems,
      };
      
    case 'ADD_SCREEN_STATE':
      if (action.currentItem) {
        if (
          action.currentItem.type === 'rectangle' &&
          (!action.currentItem.data.width || !action.currentItem.data.height)
        ) {
          return drawState;
        } else {
          return {
            ...drawState,
            screenStates: drawState.screenStates.concat([
              [...drawState.doneItems, action.currentItem],
            ]),
          };
        }
      } else {
        return {
          ...drawState,
          cancelEnabled: action.cancelEnabled ?? drawState.cancelEnabled,
          screenStates: drawState.screenStates.concat([
            [...drawState.doneItems],
          ]),
        };
      }

    case 'CANCEL':
      const len = drawState.screenStates.length;
      if (len > 1) {
        const newScreenStates = drawState.screenStates;
        newScreenStates.pop();

        return {
          ...drawState,
          cancelEnabled:
            newScreenStates.length === 1 ? false : drawState.cancelEnabled,
          doneItems: drawState.screenStates[len - 2] ?? [],
          screenStates: newScreenStates,
        };
      } else {
        return drawState;
      }
  }
};

const DrawProvider = ({ children }: { children: ReactElement }) => {
  const itemIsSelected = useSharedValue<boolean>(false);
  const strokeWidth = useSharedValue<number>(2);
  const color = useSharedValue<hslColor>('hsl(0, 100%, 0%)');
  const currentItem = useSharedValue<DrawItem | null>(null);
  const viewShot = useRef<ViewShot>(null);
  const doubleArrowTextInput = useRef<TextInput>(null);

  const [snapShotRequested, setSnapShotRequested] = useState(false);

  const [drawState, dispatchDrawStates] = useReducer(
    reducerDrawStates,
    initialState
  );
  const doSnapshot = useCallback(() => {
    if (currentItem?.value) {
      dispatchDrawStates({ type: 'ADD_DONE_ITEM', item: currentItem.value });
      currentItem.value = null;
    }
    setSnapShotRequested(true);
  }, [currentItem, dispatchDrawStates]);

  const contextValue = useMemo(
    () => ({
      drawState,
      dispatchDrawStates,
      strokeWidth,
      color,
      currentItem,
      itemIsSelected,
      viewShot,
      doubleArrowTextInput,
      doSnapshot,
      snapShotRequested,
      setSnapShotRequested,
    }),
    [
      drawState,
      dispatchDrawStates,
      strokeWidth,
      color,
      currentItem,
      itemIsSelected,
      viewShot,
      doubleArrowTextInput,
      doSnapshot,
      snapShotRequested,
      setSnapShotRequested,
    ]
  );

  return (
    <DrawContext.Provider value={contextValue}>{children}</DrawContext.Provider>
  );
};

export default DrawProvider;
