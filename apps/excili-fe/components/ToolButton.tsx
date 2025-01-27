import { ReactNode } from "react";

export function ToolButton({
    icon,
    active,
    onClick,

}:{
    icon: ReactNode,
    active:boolean,
    onClick: ()=>void
}) {
    return <div
    onClick={onClick}
    className={`${active? "text-red-800":"text-gray"} text-gray-50`}>
        {icon}
    </div>
}
