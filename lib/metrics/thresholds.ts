/**
 * 純粋発話速度の閾値
 */
export const PURE_SPEAKING_SPEED_THRESHOLDS = {
    SLOW:           {min:   0, max: 149},
    SLIGHTLY_SLOW:  {min: 150, max: 199},
    STANDARD:       {min: 200, max: 299},
    SLIGHTLY_FAST:  {min: 300, max: 350},
    FAST:           {min: 351, max: 999},
} as const;
/**
 * 淀み率の閾値
 * 淀み率は0.01->1.00のように変換されている前提
 */
export const STAGNATION_RATE_THRESHOLDS = {
    LESS:           {min:     0, max:   0.99},
    SLIGHTLY_LESS:  {min:  1.00, max:   5.99},
    STANDARD:       {min:  6.00, max:   9.99},
    SLIGHTLY_MUCH:  {min: 10.00, max:  19.99},
    MUCH:           {min: 20.00, max: 100.00},
} as const;
