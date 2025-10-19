# Accessibility Guide

This application is built with WCAG 2.1 AA compliance in mind, ensuring that it's accessible to all users, including those using assistive technologies.

## Overview

The survey tool implements comprehensive accessibility features to support:
- Screen reader users (VoiceOver, NVDA, JAWS)
- Keyboard-only navigation
- Users with visual impairments
- Users with motor disabilities
- Users who prefer reduced motion
- Users requiring high contrast

## WCAG 2.1 AA Compliance

### Perceivable
- **Text Alternatives**: All images and icons have appropriate alternative text or are marked as decorative with `aria-hidden="true"`
- **Color Independence**: Information is not conveyed by color alone
- **Contrast**: Minimum contrast ratio of 4.5:1 for normal text, 3:1 for large text
- **Responsive Design**: Content reflows up to 400% zoom without loss of functionality

### Operable
- **Keyboard Access**: All functionality is available via keyboard
- **Skip Navigation**: Skip-to-content link allows bypassing repeated navigation
- **Focus Indicators**: Clear, high-contrast focus indicators (3px blue outline)
- **No Keyboard Traps**: Users can navigate through all content without getting stuck
- **Timing**: No time limits on survey completion

### Understandable
- **Consistent Navigation**: Navigation patterns are consistent throughout
- **Error Identification**: Form errors are clearly identified and described
- **Labels and Instructions**: All form inputs have visible labels and help text where needed
- **Predictable**: UI behaves predictably with no unexpected context changes

### Robust
- **Valid HTML**: Semantic HTML5 elements used throughout
- **ARIA**: Proper ARIA roles, states, and properties where needed
- **Progressive Enhancement**: Works with JavaScript disabled (where possible)

## Features Implemented

### 1. Skip Navigation
A skip-to-content link appears at the top of each page when focused (Tab key), allowing keyboard users to bypass navigation.

```tsx
// Located in: web/src/App.tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### 2. Screen Reader Support

#### Live Regions
Dynamic content changes are announced to screen readers:

```tsx
// Section changes in SurveyFlow
<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
  Now on section 2 of 4: Contact Information
</div>
```

#### Loading States
```tsx
<div role="status" aria-live="polite">
  <span className="sr-only">Loading survey...</span>
  {/* Spinner visual */}
</div>
```

#### Error States
```tsx
<div role="alert" aria-live="assertive">
  Error loading survey. Please try again.
</div>
```

### 3. Form Accessibility

#### Text Inputs
All text inputs have proper labels and ARIA attributes:

```tsx
<label htmlFor="question-123" className="block font-medium mb-1">
  What is your name? {required && <span aria-label="required">*</span>}
</label>
<input
  id="question-123"
  type="text"
  aria-required={required}
  aria-describedby={helpText ? "help-123" : undefined}
/>
{helpText && <p id="help-123" className="text-sm text-gray-500">{helpText}</p>}
```

#### Radio Buttons (Single Choice)
Grouped with fieldset and legend:

```tsx
<fieldset role="radiogroup">
  <legend className="block font-medium mb-2">
    Choose one option {required && <span aria-label="required">*</span>}
  </legend>
  {options.map(option => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={`question-${id}`}
        value={option.value}
        aria-required={required}
      />
      <span>{option.label}</span>
    </label>
  ))}
</fieldset>
```

#### Checkboxes (Multi Choice)
Grouped with fieldset and legend:

```tsx
<fieldset>
  <legend className="block font-medium mb-2">
    Select all that apply {required && <span aria-label="required">*</span>}
  </legend>
  <div role="group" aria-label={question.text}>
    {options.map(option => (
      <label className="flex items-center gap-2">
        <input type="checkbox" value={option.value} />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
</fieldset>
```

#### Sliders (Likert/NPS Scale)
With ARIA value attributes and live announcements:

```tsx
<div>
  <label htmlFor={inputId} className="block font-medium mb-2">
    Rate your satisfaction (1-5)
  </label>
  <input
    id={inputId}
    type="range"
    min="1"
    max="5"
    value={currentValue}
    aria-valuemin={1}
    aria-valuemax={5}
    aria-valuenow={currentValue}
    aria-valuetext={`${currentValue} out of 5`}
    aria-required={required}
    aria-describedby={helpText ? `help-${id}` : undefined}
  />
  <div className="sr-only" role="status" aria-live="polite">
    Current rating: {currentValue}
  </div>
</div>
```

### 4. Button Accessibility

Navigation buttons have descriptive labels:

```tsx
<button
  onClick={goPrev}
  disabled={currentSectionIndex === 0 || saving}
  aria-label="Previous section (Section 1)"
  aria-disabled={currentSectionIndex === 0 || saving}
>
  Previous
</button>

<button
  onClick={goNext}
  disabled={saving}
  aria-label="Next section (Section 3)"
  aria-busy={saving}
>
  Next
</button>
```

### 5. Progress Indicator

The survey progress bar is accessible:

```tsx
<div
  role="progressbar"
  aria-valuenow={50}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Survey progress: Section 2 of 4"
>
  <div style={{ width: '50%' }} />
</div>
```

### 6. Visual Design

#### Focus Indicators
```css
/* Enhanced focus styles in index.css */
:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

#### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --tw-prose-body: #000;
    --tw-prose-headings: #000;
  }
  
  button {
    border: 2px solid currentColor;
  }
}
```

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Screen Reader Only Content
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Keyboard Navigation

### Global Shortcuts
- **Tab**: Move to next interactive element
- **Shift + Tab**: Move to previous interactive element
- **Enter**: Activate buttons and links
- **Space**: Toggle checkboxes, activate buttons

### Survey Form
- **Tab**: Navigate through form fields
- **Arrow Keys**: Navigate within radio groups
- **Space**: Select/deselect checkboxes
- **Arrow Keys**: Adjust slider values (when slider is focused)
- **Enter**: Submit current section or complete survey

### Skip Navigation
- **Tab** (from page load): Focus skip-to-content link
- **Enter** (on skip link): Jump to main content

## Testing with Screen Readers

### macOS - VoiceOver
1. Enable: **Cmd + F5**
2. Navigate: **Control + Option + Arrow Keys**
3. Interact with groups: **Control + Option + Shift + Down Arrow**
4. Stop interacting: **Control + Option + Shift + Up Arrow**

### Windows - NVDA (Free)
1. Download from: https://www.nvaccess.org/
2. Navigate: **Arrow Keys**
3. Browse mode: **NVDA + Space**
4. Forms mode: Automatic when entering form field

### Testing Checklist
- [ ] All images have appropriate alt text
- [ ] All form inputs have visible labels
- [ ] Required fields are announced as required
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced
- [ ] Can complete entire survey using only keyboard
- [ ] Focus indicator is always visible
- [ ] Page structure makes sense (headings, landmarks)
- [ ] Skip navigation link works
- [ ] Loading states are announced
- [ ] Section changes are announced

## Browser Support

Accessibility features are tested and supported in:
- Chrome 90+ (macOS, Windows, Linux)
- Firefox 88+ (macOS, Windows, Linux)
- Safari 14+ (macOS, iOS)
- Edge 90+ (Windows)

## Known Limitations

1. **JavaScript Required**: Survey functionality requires JavaScript enabled
2. **Offline Mode**: Limited accessibility testing in offline mode
3. **Mobile Screen Readers**: Testing primarily done on desktop screen readers

## Reporting Issues

If you encounter any accessibility barriers, please report them:
1. Describe the issue clearly
2. Include the page/component where it occurs
3. Specify the assistive technology you're using (screen reader, browser, OS)
4. Include steps to reproduce

## Future Improvements

Planned accessibility enhancements:
- [ ] Enhanced keyboard shortcuts (e.g., Ctrl+Enter to submit)
- [ ] Focus restoration after section navigation
- [ ] More granular live region announcements
- [ ] Skip to previous/next section shortcuts
- [ ] Improved mobile screen reader support
- [ ] Automated accessibility testing in CI/CD

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Compliance Statement

This application strives to conform to WCAG 2.1 Level AA standards. If you experience any difficulty accessing content or using features, please contact us so we can assist you and work to improve accessibility.

Last Updated: January 2025
