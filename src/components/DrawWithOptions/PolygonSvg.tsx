import * as React from 'react';
import Svg, { Defs, Path, G, Mask, Use, SvgProps } from 'react-native-svg';

export default function PolygonSvg(props: SvgProps) {
  return (
    <Svg viewBox="0 0 28 28" {...props}>
      <Defs>
        <Path
          id="prefix__a"
          d="M14 2 L25 10.5 L20 25 H8 L3 10.5 Z"
        />
      </Defs>
      <G fill="none" fillRule="evenodd">
        <Mask id="prefix__b" fill="#fff">
          <Use xlinkHref="#prefix__a" />
        </Mask>
        <Use fill="#000" fillRule="nonzero" xlinkHref="#prefix__a" />
        <G fill="#FFF" mask="url(#prefix__b)">
          <Path d="M0 0h28v28H0z" />
        </G>
      </G>
    </Svg>
  );
}
