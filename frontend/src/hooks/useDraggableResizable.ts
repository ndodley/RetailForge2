import { useCallback, useRef, useState } from 'react'

const DEFAULT_WIDTH = 340
const DEFAULT_HEIGHT = 460
const MIN_WIDTH = 280
const MIN_HEIGHT = 320
const MARGIN = 24
const LAUNCHER_CLEARANCE = 92 // keep the panel from covering the launcher button below it

interface Rect {
    left: number
    top: number
    width: number
    height: number
}

function defaultRect(): Rect {
    const width = DEFAULT_WIDTH
    const height = DEFAULT_HEIGHT
    return {
        width,
        height,
        left: window.innerWidth - width - MARGIN,
        top: window.innerHeight - height - MARGIN - LAUNCHER_CLEARANCE,
    }
}

function clampRect(rect: Rect): Rect {
    const maxLeft = Math.max(0, window.innerWidth - rect.width)
    const maxTop = Math.max(0, window.innerHeight - rect.height)
    return {
        ...rect,
        left: Math.min(Math.max(rect.left, 0), maxLeft),
        top: Math.min(Math.max(rect.top, 0), maxTop),
    }
}

// Lets the chat panel be dragged by its header and resized from its corner
// handle, using plain mouse events - no extra library needed for something
// this small. Position/size live only in React state for the current page
// load, resetting to the default bottom-right placement on reload.
export function useDraggableResizable() {
    const [rect, setRect] = useState<Rect>(defaultRect)
    const dragOrigin = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
    const resizeOrigin = useRef<{ x: number; y: number; width: number; height: number } | null>(null)

    const onDragMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setRect(current => {
            dragOrigin.current = { x: e.clientX, y: e.clientY, left: current.left, top: current.top }
            return current
        })
        document.body.style.userSelect = 'none'

        function onMouseMove(ev: MouseEvent) {
            const origin = dragOrigin.current
            if (!origin) return
            setRect(prev => clampRect({
                ...prev,
                left: origin.left + (ev.clientX - origin.x),
                top: origin.top + (ev.clientY - origin.y),
            }))
        }
        function onMouseUp() {
            dragOrigin.current = null
            document.body.style.userSelect = ''
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    }, [])

    const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setRect(current => {
            resizeOrigin.current = { x: e.clientX, y: e.clientY, width: current.width, height: current.height }
            return current
        })
        document.body.style.userSelect = 'none'

        function onMouseMove(ev: MouseEvent) {
            const origin = resizeOrigin.current
            if (!origin) return
            setRect(prev => {
                const maxWidth = window.innerWidth - prev.left
                const maxHeight = window.innerHeight - prev.top
                return {
                    ...prev,
                    width: Math.min(Math.max(origin.width + (ev.clientX - origin.x), MIN_WIDTH), maxWidth),
                    height: Math.min(Math.max(origin.height + (ev.clientY - origin.y), MIN_HEIGHT), maxHeight),
                }
            })
        }
        function onMouseUp() {
            resizeOrigin.current = null
            document.body.style.userSelect = ''
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    }, [])

    return {
        style: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        onDragMouseDown,
        onResizeMouseDown,
    }
}
