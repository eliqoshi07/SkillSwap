import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};
export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}
