import { s2d } from "../helpers/ms2";
import AnimatedCounter from "./ticker";
import clsx from 'clsx'

export default function TickerTime({ timeMs, className, displayMs = false, msPrecision = 3 }: { timeMs: number, className?: string, displayMs?: boolean, msPrecision?: number }) {
    let time = s2d(timeMs);

    return (
        <div className={clsx("flex justify-center items-center font-mono", className)}>
        {time.getHours() > 0 ? <AnimatedCounter value={time.getHours()} className="font-mono inline" decimalPrecision={0} padNumber={2} showColorsWhenValueChanges={false} /> : null}
        <AnimatedCounter value={time.getMinutes()} className="font-mono inline" decimalPrecision={0} padNumber={2} showColorsWhenValueChanges={false} />:
        <AnimatedCounter value={time.getSeconds()} className="font-mono inline" decimalPrecision={0 } padNumber={2} showColorsWhenValueChanges={false} />
        {displayMs ? <>.<AnimatedCounter value={time.getMilliseconds()} className="font-mono inline" decimalPrecision={msPrecision} padNumber={3} showColorsWhenValueChanges={false} /></> : null}
          </div>
    )
}