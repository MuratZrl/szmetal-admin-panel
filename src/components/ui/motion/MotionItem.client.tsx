'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

type Props = {
  /** Custom Framer Motion variant override */
  variants?: Variants;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export default function MotionItem({ variants, children, className, style }: Props) {
  return (
    <motion.div variants={variants ?? defaultVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}
