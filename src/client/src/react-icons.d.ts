declare module 'react-icons/*' {
  import { FC, SVGAttributes } from 'react';
  
  export interface IconBaseProps extends SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }
  
  type IconType = FC<IconBaseProps>;
  export default IconType;
  export { IconType };
}
