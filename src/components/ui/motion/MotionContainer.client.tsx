'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';

type Props = {
  /** Stagger delay between children (seconds). Default: 0.1 */
  stagger?: number;
  /** Initial delay before first child animates (seconds). Default: 0.05 */
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export default function MotionContainer({
  stagger = 0.1,
  delay = 0.05,
  children,
  className,
  style,
}: Props) {
  const variants: Variants = React.useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: stagger,
          delayChildren: delay,
        },
      },
    }),
    [stagger, delay],
  );

  return (
    <motion.div variants={variants} initial="hidden" animate="visible" className={className} style={style}>
      {children}
    </motion.div>
  );
}
