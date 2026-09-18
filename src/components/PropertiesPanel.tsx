import React, { useCallback } from 'react';
import { useEditorStore } from '../store';
import type { DesignElement } from '../types';

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min, max, step = 1, unit }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontSize: 11, color: '#666', width: 14, textAlign: 'center' }}>{label}</span>
    <input
      type="number"
      value={Math.round(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      style={{
        flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 3,
        color: '#ccc', fontSize: 11, padding: '3px 6px', outline: 'none', width: '100%',
      }}
    />
    {unit && <span style={{ fontSize: 10, color: '#555' }}>{unit}</span>}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ borderBottom: '1px solid #2a2a2a', padding: '8px 12px' }}>
    <div style={{ fontSize: 10, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
      {title}
    </div>
    {children}
  </div>
);

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 11, color: '#888', width: 60 }}>{label}</span>
    <div style={{ position: 'relative' }}>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 24, height: 24, border: '1px solid #333', borderRadius: 3, cursor: 'pointer', padding: 0 }}
      />
    </div>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 3,
        color: '#ccc', fontSize: 11, padding: '3px 6px', outline: 'none',
      }}
    />
  </div>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 11, color: '#888', width: 60 }}>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 3,
        color: '#ccc', fontSize: 11, padding: '3px 6px', outline: 'none',
      }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const PropertiesPanel: React.FC = () => {
  const { elements, selectedIds, updateElement, pushHistory } = useEditorStore();

  const selectedEl = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

  const handleUpdate = useCallback((updates: Partial<DesignElement>) => {
    if (!selectedEl) return;
    updateElement(selectedEl.id, updates);
  }, [selectedEl, updateElement]);

  const handleCommit = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  if (!selectedEl) {
    return (
      <div style={{
        width: 260,
        background: '#1a1a1a',
        borderLeft: '1px solid #2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid #2a2a2a',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Properties
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <p style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
            Select an element to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const isText = selectedEl.type === 'text' || selectedEl.type === 'heading' || selectedEl.type === 'paragraph' || selectedEl.type === 'button';

  return (
    <div style={{
      width: 260,
      background: '#1a1a1a',
      borderLeft: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid #2a2a2a',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {selectedEl.type}
        </span>
        <span style={{ fontSize: 10, color: '#555' }}>{selectedEl.name}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Position */}
        <Section title="Position & Size">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <NumberInput label="X" value={selectedEl.x} onChange={(v) => { handleUpdate({ x: v }); handleCommit(); }} />
            <NumberInput label="Y" value={selectedEl.y} onChange={(v) => { handleUpdate({ y: v }); handleCommit(); }} />
            <NumberInput label="W" value={selectedEl.width} onChange={(v) => { handleUpdate({ width: v }); handleCommit(); }} min={1} />
            <NumberInput label="H" value={selectedEl.height} onChange={(v) => { handleUpdate({ height: v }); handleCommit(); }} min={1} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
            <NumberInput label="R" value={selectedEl.rotation} onChange={(v) => handleUpdate({ rotation: v })} unit="deg" />
            <NumberInput label="O" value={selectedEl.opacity * 100} onChange={(v) => handleUpdate({ opacity: v / 100 })} min={0} max={100} unit="%" />
          </div>
        </Section>

        {/* Layout */}
        <Section title="Layout">
          <SelectInput
            label="Display"
            value={selectedEl.layout.display}
            options={[
              { value: 'block', label: 'Block' },
              { value: 'flex', label: 'Flex' },
              { value: 'grid', label: 'Grid' },
              { value: 'none', label: 'None' },
            ]}
            onChange={(v) => handleUpdate({ layout: { ...selectedEl.layout, display: v as any } })}
          />
          {selectedEl.layout.display === 'flex' && (
            <>
              <div style={{ marginTop: 6 }}>
                <SelectInput
                  label="Direction"
                  value={selectedEl.layout.flexDirection}
                  options={[
                    { value: 'row', label: 'Row' },
                    { value: 'column', label: 'Column' },
                  ]}
                  onChange={(v) => handleUpdate({ layout: { ...selectedEl.layout, flexDirection: v as any } })}
                />
              </div>
              <div style={{ marginTop: 6 }}>
                <SelectInput
                  label="Justify"
                  value={selectedEl.layout.justifyContent}
                  options={[
                    { value: 'flex-start', label: 'Start' },
                    { value: 'center', label: 'Center' },
                    { value: 'flex-end', label: 'End' },
                    { value: 'space-between', label: 'Space Between' },
                    { value: 'space-around', label: 'Space Around' },
                  ]}
                  onChange={(v) => handleUpdate({ layout: { ...selectedEl.layout, justifyContent: v as any } })}
                />
              </div>
              <div style={{ marginTop: 6 }}>
                <SelectInput
                  label="Align"
                  value={selectedEl.layout.alignItems}
                  options={[
                    { value: 'flex-start', label: 'Start' },
                    { value: 'center', label: 'Center' },
                    { value: 'flex-end', label: 'End' },
                    { value: 'stretch', label: 'Stretch' },
                  ]}
                  onChange={(v) => handleUpdate({ layout: { ...selectedEl.layout, alignItems: v as any } })}
                />
              </div>
              <div style={{ marginTop: 6 }}>
                <NumberInput label="Gap" value={selectedEl.layout.gap} onChange={(v) => handleUpdate({ layout: { ...selectedEl.layout, gap: v } })} unit="px" />
              </div>
            </>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
            <NumberInput label="Pos" value={0} onChange={() => {}} />
            <SelectInput
              label=""
              value={selectedEl.position}
              options={[
                { value: 'relative', label: 'Relative' },
                { value: 'absolute', label: 'Absolute' },
                { value: 'fixed', label: 'Fixed' },
              ]}
              onChange={(v) => handleUpdate({ position: v as any })}
            />
          </div>
        </Section>

        {/* Padding */}
        <Section title="Padding">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <NumberInput label="T" value={selectedEl.padding.top} onChange={(v) => handleUpdate({ padding: { ...selectedEl.padding, top: v } })} />
            <NumberInput label="R" value={selectedEl.padding.right} onChange={(v) => handleUpdate({ padding: { ...selectedEl.padding, right: v } })} />
            <NumberInput label="B" value={selectedEl.padding.bottom} onChange={(v) => handleUpdate({ padding: { ...selectedEl.padding, bottom: v } })} />
            <NumberInput label="L" value={selectedEl.padding.left} onChange={(v) => handleUpdate({ padding: { ...selectedEl.padding, left: v } })} />
          </div>
        </Section>

        {/* Fill */}
        <Section title="Fill">
          <ColorInput label="Color" value={selectedEl.background} onChange={(v) => handleUpdate({ background: v })} />
        </Section>

        {/* Stroke */}
        <Section title="Stroke">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <NumberInput label="W" value={selectedEl.border.width} onChange={(v) => handleUpdate({ border: { ...selectedEl.border, width: v } })} />
            <SelectInput
              label=""
              value={selectedEl.border.style}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
                { value: 'none', label: 'None' },
              ]}
              onChange={(v) => handleUpdate({ border: { ...selectedEl.border, style: v as any } })}
            />
          </div>
          <div style={{ marginTop: 6 }}>
            <ColorInput label="Color" value={selectedEl.border.color} onChange={(v) => handleUpdate({ border: { ...selectedEl.border, color: v } })} />
          </div>
        </Section>

        {/* Radius */}
        <Section title="Radius">
          <NumberInput label="R" value={selectedEl.borderRadius} onChange={(v) => handleUpdate({ borderRadius: v })} unit="px" />
        </Section>

        {/* Effects */}
        <Section title="Effects">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <NumberInput label="X" value={selectedEl.shadow?.x || 0} onChange={(v) => handleUpdate({ shadow: { ...selectedEl.shadow || { x: 0, y: 0, blur: 0, spread: 0, color: '#00000033' }, x: v } })} />
            <NumberInput label="Y" value={selectedEl.shadow?.y || 0} onChange={(v) => handleUpdate({ shadow: { ...selectedEl.shadow || { x: 0, y: 0, blur: 0, spread: 0, color: '#00000033' }, y: v } })} />
            <NumberInput label="B" value={selectedEl.shadow?.blur || 0} onChange={(v) => handleUpdate({ shadow: { ...selectedEl.shadow || { x: 0, y: 0, blur: 0, spread: 0, color: '#00000033' }, blur: v } })} />
            <NumberInput label="S" value={selectedEl.shadow?.spread || 0} onChange={(v) => handleUpdate({ shadow: { ...selectedEl.shadow || { x: 0, y: 0, blur: 0, spread: 0, color: '#00000033' }, spread: v } })} />
          </div>
          {selectedEl.shadow && (
            <div style={{ marginTop: 6 }}>
              <ColorInput label="Color" value={selectedEl.shadow.color} onChange={(v) => handleUpdate({ shadow: { ...selectedEl.shadow!, color: v } })} />
            </div>
          )}
        </Section>

        {/* Typography */}
        {isText && selectedEl.typography && (
          <Section title="Typography">
            <div style={{ marginBottom: 6 }}>
              <SelectInput
                label="Font"
                value={selectedEl.typography.fontFamily}
                options={[
                  { value: 'Inter, sans-serif', label: 'Inter' },
                  { value: 'Georgia, serif', label: 'Georgia' },
                  { value: 'monospace', label: 'Monospace' },
                  { value: 'Arial, sans-serif', label: 'Arial' },
                  { value: 'system-ui', label: 'System' },
                ]}
                onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, fontFamily: v } })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <NumberInput label="Sz" value={selectedEl.typography.fontSize} onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, fontSize: v } })} unit="px" />
              <NumberInput label="Wt" value={selectedEl.typography.fontWeight} onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, fontWeight: v } })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
              <NumberInput label="LH" value={selectedEl.typography.lineHeight} onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, lineHeight: v } })} step={0.1} />
              <NumberInput label="LS" value={selectedEl.typography.letterSpacing} onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, letterSpacing: v } })} step={0.1} />
            </div>
            <div style={{ marginTop: 6 }}>
              <SelectInput
                label="Align"
                value={selectedEl.typography.textAlign}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                  { value: 'justify', label: 'Justify' },
                ]}
                onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, textAlign: v as any } })}
              />
            </div>
            <div style={{ marginTop: 6 }}>
              <SelectInput
                label="Case"
                value={selectedEl.typography.textTransform}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'uppercase', label: 'Upper' },
                  { value: 'lowercase', label: 'Lower' },
                  { value: 'capitalize', label: 'Capitalize' },
                ]}
                onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, textTransform: v as any } })}
              />
            </div>
            <div style={{ marginTop: 6 }}>
              <ColorInput label="Color" value={selectedEl.typography.color} onChange={(v) => handleUpdate({ typography: { ...selectedEl.typography!, color: v } })} />
            </div>
          </Section>
        )}

        {/* Content */}
        {isText && (
          <Section title="Content">
            <textarea
              value={selectedEl.content}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              onBlur={handleCommit}
              rows={3}
              style={{
                width: '100%', background: '#252525', border: '1px solid #333', borderRadius: 3,
                color: '#ccc', fontSize: 11, padding: '6px 8px', outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </Section>
        )}
      </div>
    </div>
  );
};
