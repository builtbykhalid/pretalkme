import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

// Images for the squares — using consultant/business-themed Unsplash images
const images = [
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
];

// Helper function to get the path offset for a specific index
function getPathOffset(index: number) {
    return index / 8;
}

function SquareWithOffset({
    index,
    parentIndex,
}: {
    index: number;
    parentIndex: number;
}) {
    const image = images[index];
    const firstSquareOffset = useMotionValue(0);

    useEffect(() => {
        const controls = animate(firstSquareOffset, 1, {
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 1,
            ease: [0.42, 0, 0.58, 1],
            duration: 7,
        });
        return () => controls.stop();
    }, [firstSquareOffset]);

    const x = useTransform(firstSquareOffset, (offset) => {
        const firstAngle = ((getPathOffset(index) + offset) % 1) * Math.PI * 2;
        const lastAngle = ((getPathOffset(parentIndex) + offset) % 1) * Math.PI * 2;
        return Math.cos(firstAngle) * 240 - Math.cos(lastAngle) * 240;
    });

    const y = useTransform(firstSquareOffset, (offset) => {
        const firstAngle = ((getPathOffset(index) + offset) % 1) * Math.PI * 2;
        const lastAngle = ((getPathOffset(parentIndex) + offset) % 1) * Math.PI * 2;
        return Math.sin(firstAngle) * 240 - Math.sin(lastAngle) * 240;
    });

    return (
        <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ x, y }}
        >
            <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
            />
        </motion.div>
    );
}

function Square({
    index,
    children,
}: {
    index: number;
    children?: React.ReactNode;
}) {
    const image = images[index];
    const pathOffset = useMotionValue(getPathOffset(index));

    useEffect(() => {
        const controls = animate(pathOffset, pathOffset.get() + 1, {
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 1,
            ease: [0.42, 0, 0.58, 1],
            duration: 7,
        });
        return () => controls.stop();
    }, [pathOffset]);

    const x = useTransform(pathOffset, (offset) => {
        const angle = (offset % 1) * Math.PI * 2;
        return Math.cos(angle) * 240;
    });

    const y = useTransform(pathOffset, (offset) => {
        const angle = (offset % 1) * Math.PI * 2;
        return Math.sin(angle) * 240;
    });

    return (
        <motion.div
            key={index}
            className="absolute rounded-2xl overflow-hidden shadow-xl"
            style={{
                width: 130,
                height: 130,
                left: "calc(50% - 65px)",
                top: "calc(50% - 65px)",
                x,
                y,
            }}
            initial={{
                opacity: 0,
                scale: 0.9,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            transition={{
                opacity: {
                    duration: 1,
                    delay: index * 0.12 + 0.35,
                    ease: "easeOut",
                },
                scale: {
                    duration: 1,
                    delay: index * 0.12 + 0.35,
                    ease: "easeOut",
                },
            }}
        >
            <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
            />
            <motion.div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{
                    duration: 1,
                    delay: index * 0.12 + 0.35,
                    ease: "easeOut",
                }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

export default function LoopingImages() {
    const lastIndex = images.length - 1;

    return (
        <div className="relative w-[540px] h-[540px] md:w-[620px] md:h-[620px] mx-auto">
            {Array.from({ length: images.length }).map((_, index) =>
                index === lastIndex ? null : <Square index={index} key={index} />
            )}
            <Square index={lastIndex}>
                <SquareWithOffset index={0} parentIndex={lastIndex} />
            </Square>
        </div>
    );
}
