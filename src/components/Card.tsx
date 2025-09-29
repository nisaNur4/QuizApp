import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function Card({ children, style = {}, className = "", onClick }: CardProps) {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
