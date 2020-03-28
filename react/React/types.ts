import { CSSProperties } from "react";
import { Component } from "./react";

export interface FC {
    (props: any): any
}

export type ElementProp = Record<string, any> & { style?: CSSProperties & Record<number, any> } & { children: ReactElement[] | any[] }

export interface ReactElement {
    type: string | FC | ComponentType,
    props: ElementProp,
    children: any[],
    key?: string
}

export type ComponentType = typeof Component