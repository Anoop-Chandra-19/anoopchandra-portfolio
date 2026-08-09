type KeyboardLegendProps = {
  isVisible: boolean;
  hasPointField: boolean;
};

export default function KeyboardLegend({ isVisible, hasPointField }: KeyboardLegendProps) {
  return (
    <aside className={`lx-keymap${isVisible ? " is-visible" : ""}`} aria-hidden="true">
      <div className="lx-keymap-title mono">⌨ key map</div>
      <dl>
        <div>
          <dt>
            <kbd>Tab</kbd>
          </dt>
          <dd>next control</dd>
        </div>
        <div>
          <dt>
            <kbd>Shift</kbd>
            <span>+</span>
            <kbd>Tab</kbd>
          </dt>
          <dd>previous</dd>
        </div>
        {hasPointField ? (
          <>
            <div>
              <dt>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <kbd>←</kbd>
                <kbd>→</kbd>
              </dt>
              <dd>move cursor</dd>
            </div>
            <div>
              <dt>
                <kbd>↑</kbd>
                <span>+</span>
                <kbd>→</kbd>
              </dt>
              <dd>move diagonally</dd>
            </div>
            <div>
              <dt>
                <kbd>Shift</kbd>
                <span>+</span>
                <kbd>↑</kbd>
              </dt>
              <dd>larger step</dd>
            </div>
            <div>
              <dt>
                <kbd>Enter</kbd>
                <span>/</span>
                <kbd>Space</kbd>
              </dt>
              <dd>place point</dd>
            </div>
            <div className="lx-keymap-class">
              <dt>
                <kbd>A</kbd>
                <span>/</span>
                <kbd>B</kbd>
              </dt>
              <dd>select class</dd>
            </div>
          </>
        ) : (
          <div>
            <dt>
              <kbd>Enter</kbd>
              <span>/</span>
              <kbd>Space</kbd>
            </dt>
            <dd>activate</dd>
          </div>
        )}
        <div>
          <dt>
            <kbd>Esc</kbd>
          </dt>
          <dd>back home</dd>
        </div>
      </dl>
    </aside>
  );
}
