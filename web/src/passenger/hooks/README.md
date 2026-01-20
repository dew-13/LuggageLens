# Animation Hooks Documentation

## Overview

Custom React hooks for managing animations, transitions, and interactive effects in the passenger portal. All hooks are optimized for performance and accessibility.

## Available Hooks

### useScrollAnimation

Triggers animations when elements enter the viewport.

```jsx
const { ref, isVisible } = useScrollAnimation({
  threshold: 0.1
});

return <div ref={ref}>{isVisible ? 'Content' : null}</div>;
```

**Parameters:**
- `options` (object) - IntersectionObserver options

**Returns:**
- `ref` - Ref to attach to element
- `isVisible` - Boolean indicating if element is visible

**Use Cases:**
- Lazy load content
- Trigger animations on scroll
- Track element visibility

---

### useFadeTransition

Manages fade in/out transitions with optional cleanup.

```jsx
const { isVisible, setIsVisible, shouldRender, style } = useFadeTransition(false, 300);

return (
  <>
    <button onClick={() => setIsVisible(!isVisible)}>Toggle</button>
    {shouldRender && <div style={style}>Fading content</div>}
  </>
);
```

**Parameters:**
- `initialState` (boolean) - Initial visibility state
- `duration` (number) - Transition duration in ms

**Returns:**
- `isVisible` - Current visibility state
- `setIsVisible` - Function to toggle visibility
- `shouldRender` - Whether element should be in DOM
- `style` - CSS style object with opacity transition

**Use Cases:**
- Modal animations
- Toast notifications
- Conditional content with fade
- Smooth hide/show transitions

---

### useStaggerAnimation

Generates staggered animation delays for list items.

```jsx
const { getDelay } = useStaggerAnimation(10, 60);

return items.map((item, i) => (
  <div style={{ animationDelay: getDelay(i) }} key={i}>
    {item}
  </div>
));
```

**Parameters:**
- `itemCount` (number) - Number of items (optional)
- `delay` (number) - Delay between items in ms (default: 50)

**Returns:**
- `getDelay(index)` - Function returning formatted delay string

**Use Cases:**
- List item animations
- Cascading entrance animations
- Waterfall effects
- Staggered form field animations

---

### useModalAnimation

Manages modal open/close animations with proper timing.

```jsx
const { shouldRender, isAnimating, backdropStyle, modalStyle } = useModalAnimation(isOpen);

return shouldRender ? (
  <div style={backdropStyle}>
    <div style={modalStyle}>Modal content</div>
  </div>
) : null;
```

**Parameters:**
- `isOpen` (boolean) - Whether modal is open

**Returns:**
- `shouldRender` - Whether to render in DOM
- `isAnimating` - Current animation state
- `backdropStyle` - Style object for backdrop
- `modalStyle` - Style object for modal container

**Use Cases:**
- Dialog animations
- Confirmation modals
- Overlay animations
- Proper cleanup on close

---

### useCountUp

Animates number counting from 0 to target value.

```jsx
const count = useCountUp(1234, 2000, true);

return <div className="text-3xl font-bold">{count}</div>;
```

**Parameters:**
- `endValue` (number) - Target number value
- `duration` (number) - Animation duration in ms (default: 2000)
- `shouldStart` (boolean) - Whether to start animation (default: true)

**Returns:**
- `count` (number) - Current animated value

**Use Cases:**
- Stat counters
- Progress indicators
- Score displays
- Badge counts

**Performance Note:** Updates run at ~60fps with requestAnimationFrame-like timing.

---

### useRipple

Creates ripple/click effect animations.

```jsx
const { ref, ripples, addRipple } = useRipple();

return (
  <button 
    ref={ref} 
    onClick={addRipple}
    style={{ position: 'relative', overflow: 'hidden' }}
  >
    Click me
    {ripples.map(ripple => (
      <span
        key={ripple.id}
        style={{
          position: 'absolute',
          left: ripple.x,
          top: ripple.y,
          width: ripple.size,
          height: ripple.size,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.6)',
          animation: 'ripple 0.6s ease-out'
        }}
      />
    ))}
  </button>
);
```

**Returns:**
- `ref` - Ref to attach to clickable element
- `ripples` - Array of active ripple objects
- `addRipple(event)` - Function to trigger ripple animation

**Use Cases:**
- Material Design-inspired button effects
- Click feedback animations
- Interactive button feedback

---

### useParallax

Applies parallax scroll effect to elements.

```jsx
const { ref, style } = useParallax(0.5);

return (
  <div ref={ref} style={style}>
    Parallax content
  </div>
);
```

**Parameters:**
- `speed` (number) - Parallax speed multiplier (default: 0.5)

**Returns:**
- `ref` - Ref to attach to element
- `style` - Transform style with parallax effect

**Use Cases:**
- Background parallax effects
- Hero section animations
- Depth effects
- Floating elements

**Performance Note:** Uses scroll listener; consider debouncing for many elements.

---

### usePageTransition

Manages full page transition animations.

```jsx
const { isExiting, triggerExit, pageStyle } = usePageTransition();

const navigate = useNavigate();
const handleNavigate = (path) => {
  triggerExit();
  setTimeout(() => navigate(path), 300);
};

return <div style={pageStyle}>Page content</div>;
```

**Returns:**
- `isExiting` - Whether page is exiting
- `triggerExit()` - Function to start exit animation
- `pageStyle` - CSS style for fade out effect

**Use Cases:**
- Route transitions
- Page swaps
- Navigation animations
- Smooth page changes

---

## Hook Patterns

### Combining Multiple Hooks

```jsx
function AdvancedComponent() {
  const { ref, isVisible } = useScrollAnimation();
  const { getDelay } = useStaggerAnimation(5, 80);
  
  return (
    <div ref={ref}>
      {isVisible && items.map((item, i) => (
        <div style={{ animationDelay: getDelay(i) }}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

### With Modal

```jsx
function ModalWithAnimation() {
  const [isOpen, setIsOpen] = useState(false);
  const modal = useModalAnimation(isOpen);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {modal.shouldRender && (
        <div style={modal.backdropStyle}>
          <div style={modal.modalStyle}>
            Modal Content
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
```

## Performance Tips

1. **useScrollAnimation**: Add `threshold` to optimize observer
2. **useCountUp**: Consider `shouldStart` to prevent unnecessary calculations
3. **useRipple**: Clean up ripples automatically after 600ms
4. **useParallax**: Avoid using on many elements simultaneously
5. **useFadeTransition**: Properly render/unrender to free DOM nodes

## Browser Compatibility

- Modern browsers (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)
- CSS animations via `@keyframes`
- IntersectionObserver API for scroll detection
- RequestAnimationFrame for smooth updates

## Testing

```jsx
// Test count-up animation
render(<TestComponent count={useCountUp(100, 1000)} />);
setTimeout(() => {
  expect(getByText('100')).toBeInTheDocument();
}, 1000);

// Test fade transition
const { result } = renderHook(() => useFadeTransition(false, 300));
act(() => result.current.setIsVisible(true));
expect(result.current.isVisible).toBe(true);
```

## Troubleshooting

**Animations not triggering:**
- Verify hook return values are correctly used
- Check CSS class names match
- Ensure animations.css is imported

**Performance issues:**
- Profile with DevTools Performance
- Reduce number of animated elements
- Increase scroll listener debounce
- Use will-change CSS property

**Memory leaks:**
- Verify cleanup functions in useEffect
- Check IntersectionObserver cleanup
- Ensure listeners are removed on unmount
