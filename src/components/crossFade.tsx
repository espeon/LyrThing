import { css } from "@emotion/css";
import clsx from "clsx";
import * as React from "react";
import { CSSProperties, useEffect, useRef, useState } from "react";

type Props = {
    contentKey: string;
    onTransition?: (from: HTMLElement, to: HTMLElement) => void;
    timeout?: number;
    style?: CSSProperties;
    children: React.ReactNode;
};

export const CrossFade = ({ contentKey, onTransition, timeout = 400, style, children }: Props) => {
    const firstNode = useRef<HTMLElement | null>(null);
    const secondNode = useRef<HTMLElement | null>(null);

    const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [animating, setAnimating] = useState(false);
    const [currentChildren, setCurrentChildren] = useState<React.ReactNode>(children);
    const [swapped, setSwapped] = useState(false);

    useEffect(() => {
        if (contentKey !== currentChildren) {
            setSwapped((prev) => !prev);

            if (onTransition && firstNode.current && secondNode.current) {
                requestAnimationFrame(() => {
                    onTransition(swapped ? secondNode.current! : firstNode.current!, swapped ? firstNode.current! : secondNode.current!);
                });
            }

            setAnimating(true);
            animationTimer.current && clearTimeout(animationTimer.current);

            animationTimer.current = setTimeout(() => {
                setAnimating(false);
                setCurrentChildren(children);
            }, timeout);
        }
    }, [contentKey, children, timeout, onTransition, swapped]);

    useEffect(() => {
        return () => {
            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
            }
        };
    }, []);

    return (
        <div className={clsx("cross-fade-container", styles.root)} style={style}>
            <div
                className={clsx(styles.transition(timeout), styles[swapped ? "to" : "from"])}
                ref={(node) => (firstNode.current = node)}
            >
                {swapped ? (animating ? children : currentChildren) : animating ? currentChildren : null}
            </div>
            <div
                className={clsx(styles.transition(timeout), styles[swapped ? "from" : "to"])}
                ref={(node) => (secondNode.current = node)}
            >
                {swapped ? (animating ? currentChildren : null) : animating ? children : currentChildren}
            </div>
        </div>
    );
};

const styles = {
    root: css`
        display: grid;
        height: 100%;
        grid-template-rows: 100%;
        grid-template-columns: 100%;
        isolation: isolate;
    `,
    transition: (timeout: number) => css`
        grid-area: 1 / 1;
        transition: opacity ${timeout}ms ease-in-out;
    `,
    from: css`
        opacity: 0;
        z-index: -1;
    `,
    to: css`
        opacity: 1;
    `,
};
