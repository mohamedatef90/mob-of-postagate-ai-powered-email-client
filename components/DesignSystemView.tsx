import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Input } from './ui/Input';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { Select } from './ui/Select';
import { GlassCard } from './ui/GlassCard';

// --- Reusable Helper Components for the Page ---

const SectionHeader: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <header className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{description}</p>
    </header>
);

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
    <section id={id} className="mb-16 scroll-mt-24">
        <h2 className="text-3xl font-bold text-foreground border-b border-border pb-3 mb-8">{title}</h2>
        <div className="space-y-12">
            {children}
        </div>
    </section>
);

const SubSection: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">{title}</h3>
        {description && <p className="text-muted-foreground mb-6 max-w-3xl">{description}</p>}
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const CodeBlock: React.FC<{ language: string; children: string }> = ({ language, children }) => (
    <div className="bg-secondary/50 rounded-lg overflow-hidden my-4 border border-border">
        <div className="text-xs font-sans text-muted-foreground px-4 py-1 bg-secondary">{language}</div>
        <pre className="p-4 text-sm overflow-x-auto text-secondary-foreground">
            <code className={`language-${language}`}>
                {children.trim()}
            </code>
        </pre>
    </div>
);

const ColorTable: React.FC<{ title: string; colors: { name: string; variable: string; className: string; usage: string; }[], isDarkMode?: boolean }> = ({ title, colors, isDarkMode }) => (
    <div>
        <h4 className="font-semibold mb-4 text-foreground">{title}</h4>
        <div className={`border border-border rounded-lg overflow-hidden ${isDarkMode ? 'dark bg-background' : ''}`}>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-secondary/50">
                        <th className="p-3 font-medium text-left">Swatch</th>
                        <th className="p-3 font-medium text-left">Token</th>
                        <th className="p-3 font-medium text-left">CSS Variable</th>
                        <th className="p-3 font-medium text-left">Usage</th>
                    </tr>
                </thead>
                <tbody>
                    {colors.map((color, idx) => (
                        <tr key={color.name} className={`${idx > 0 ? 'border-t border-border' : ''}`}>
                            <td className="p-3"><div className={`w-10 h-10 rounded-md border border-border ${color.className}`}></div></td>
                            <td className="p-3 font-semibold text-foreground">{color.name}</td>
                            <td className="p-3 font-mono text-muted-foreground">{color.variable}</td>
                            <td className="p-3 text-muted-foreground">{color.usage}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const ComponentDisplay: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div>
        <h4 className="font-semibold mb-4 text-foreground">{title}</h4>
        <div className={`flex flex-wrap gap-4 items-center p-6 bg-secondary/30 rounded-lg border border-border ${className}`}>
            {children}
        </div>
    </div>
);

const DesignSystemView: React.FC = () => {
    const [isChecked, setIsChecked] = useState(true);
    const sections = [
        { id: 'overview', title: 'Overview' },
        { id: 'foundations', title: 'Foundations' },
        { id: 'components', title: 'Components' },
        { id: 'patterns', title: 'Patterns' },
        { id: 'accessibility', title: 'Accessibility' },
        { id: 'technical', title: 'Technical Implementation' },
        { id: 'governance', title: 'Governance' },
    ];

    const lightColors = [
        { name: 'Primary', variable: '--primary', className: 'bg-primary', usage: 'Buttons, active links, focus rings.' },
        { name: 'Secondary', variable: '--secondary', className: 'bg-secondary', usage: 'UI controls, active list items.' },
        { name: 'Destructive', variable: '--destructive', className: 'bg-destructive', usage: 'Destructive actions (e.g., delete).' },
        { name: 'Card', variable: '--card', className: 'bg-card', usage: 'Container background for content.' },
        { name: 'Background', variable: '--background', className: 'bg-background', usage: 'Main app background.' },
        { name: 'Foreground', variable: '--foreground', className: 'bg-foreground', usage: 'Primary text color.' },
        { name: 'Border', variable: '--border', className: 'bg-border', usage: 'Separators and component borders.' },
    ];
    
    const darkColors = [
        { name: 'Primary', variable: '--primary', className: 'dark bg-primary', usage: 'Vibrant actions, active elements.' },
        { name: 'Secondary', variable: '--secondary', className: 'dark bg-secondary', usage: 'Secondary buttons, selected items.' },
        { name: 'Destructive', variable: '--destructive', className: 'dark bg-destructive', usage: 'Destructive actions (e.g., delete).' },
        { name: 'Card', variable: '--card', className: 'dark bg-card', usage: 'Slightly elevated surfaces.' },
        { name: 'Background', variable: '--background', className: 'dark bg-background', usage: 'Base layer for the dark UI.' },
        { name: 'Foreground', variable: '--foreground', className: 'dark bg-foreground', usage: 'Primary text color for dark mode.' },
        { name: 'Border', variable: '--border', className: 'dark bg-border', usage: 'Subtle borders for glowing edges.' },
    ];
    
    // Mobile Settings components for demonstration
    const SettingsSectionMobile: React.FC<{ title: string, className?: string }> = ({ title, className }) => (
        <h3 className={`px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ${className}`}>{title}</h3>
    );
    const SettingsCardMobile: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
        <div className={`bg-card rounded-xl shadow-sm border border-border ${className}`}>
            {children}
        </div>
    );
    const SettingsItemMobile: React.FC<{
      title: string;
      description?: string;
      value?: string;
      hasToggle?: boolean;
      isToggleOn?: boolean;
      onToggle?: (isOn: boolean) => void;
      onClick?: () => void;
      icon?: React.ReactNode;
      disabled?: boolean;
    }> = ({ title, description, value, hasToggle, isToggleOn, onToggle, onClick, icon, disabled = false }) => {
      const content = (
        <>
          {icon && <div className="mr-4">{icon}</div>}
          <div className="flex-grow">
            <p className="font-medium text-foreground">{title}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            {value && !description && <p className="text-sm text-primary font-medium">{value}</p>}
          </div>
          {hasToggle && onToggle && (
            <ToggleSwitch checked={!!isToggleOn} onChange={onToggle} />
          )}
        </>
      );
      const itemClasses = "flex items-center w-full text-left px-4 py-3";
      if (onClick) {
        return <button onClick={onClick} className={itemClasses}>{content}</button>;
      }
      return <div className={itemClasses}>{content}</div>;
    };
    
    return (
        <div className="h-full w-full flex bg-background">
            <nav className="w-64 border-r border-border p-6 h-full overflow-y-auto shrink-0 hidden lg:block">
                <h2 className="font-bold text-lg mb-4">Posta DS</h2>
                <ul className="space-y-2">
                    {sections.map(section => (
                        <li key={section.id}>
                            <a href={`#${section.id}`} className="text-muted-foreground hover:text-foreground text-sm font-medium">{section.title}</a>
                        </li>
                    ))}
                </ul>
            </nav>
            <main className="flex-1 h-full overflow-y-auto p-6 md:p-10">
                <SectionHeader 
                    title="Posta Design System"
                    description="A unified framework for creating consistent, accessible, and high-quality user experiences across all platforms."
                />

                <Section id="overview" title="1. Overview">
                    <SubSection title="Objective" description="To establish a single source of truth for UI/UX design and front-end development. This system accelerates the design process, ensures brand consistency, and improves collaboration between designers and developers.">
                        <GlassCard className="p-6">
                            <h4 className="font-semibold text-lg mb-2">Core Principles</h4>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li><strong>Clarity First:</strong> Interfaces should be intuitive and easy to understand. Avoid ambiguity.</li>
                                <li><strong>Consistency is Key:</strong> Similar elements should look and behave in predictable ways.</li>
                                <li><strong>Efficiency by Design:</strong> Components and patterns should be reusable to speed up workflows.</li>
                                <li><strong>Accessible to All:</strong> We are committed to building products that are usable by everyone.</li>
                            </ul>
                        </GlassCard>
                    </SubSection>
                </Section>
                
                <Section id="foundations" title="2. Design Foundations">
                    <SubSection title="Color Palette" description="Our color system is built on a foundation of themeable tokens, supporting both light and dark modes while ensuring WCAG AA compliance.">
                         <div className="space-y-8">
                            <ColorTable title="Light Mode" colors={lightColors} />
                            <ColorTable title="Dark Mode" colors={darkColors} isDarkMode={true} />
                        </div>
                        <CodeBlock language="json">
{`"tokens": {
  "colors": {
    "primary": { "value": "hsl(var(--primary))" },
    "secondary": { "value": "hsl(var(--secondary))" },
    "destructive": { "value": "hsl(var(--destructive))" },
    "background": { "value": "hsl(var(--background))" },
    "foreground": { "value": "hsl(var(--foreground))" },
    "card": { "value": "hsl(var(--card))" },
    "card-foreground": { "value": "hsl(var(--card-foreground))" }
  }
}`}
                        </CodeBlock>
                    </SubSection>

                    <SubSection title="Typography" description="A clear and legible typographic scale ensures readability and visual hierarchy. We use 'Inter' for its modern and neutral characteristics.">
                        <Card className="p-6">
                            <h1 className="text-5xl font-bold">Heading 1</h1>
                            <h2 className="text-4xl font-semibold mt-2">Heading 2</h2>
                            <h3 className="text-3xl font-semibold mt-2">Heading 3</h3>
                            <h4 className="text-2xl font-semibold mt-2">Heading 4</h4>
                            <p className="text-base mt-4">This is body text. It's used for long-form content and descriptions. Clean, readable, and accessible.</p>
                            <p className="text-sm text-muted-foreground mt-2">This is muted text, used for secondary information or captions.</p>
                        </Card>
                    </SubSection>

                    <SubSection title="Spacing & Layout" description="A consistent 8-point grid system (1 unit = 8px) is used for all spacing, padding, and layout decisions. This ensures visual harmony and rhythm.">
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-lg"><span className="text-primary font-bold">16px</span></div>
                                <p className="text-xs mt-1 text-muted-foreground">2 units</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-primary/10 flex items-center justify-center rounded-lg"><span className="text-primary font-bold">24px</span></div>
                                <p className="text-xs mt-1 text-muted-foreground">3 units</p>
                            </div>
                             <div className="text-center">
                                <div className="w-32 h-32 bg-primary/10 flex items-center justify-center rounded-lg"><span className="text-primary font-bold">32px</span></div>
                                <p className="text-xs mt-1 text-muted-foreground">4 units</p>
                            </div>
                        </div>
                    </SubSection>
                </Section>
                
                <Section id="components" title="3. Component Library">
                    <SubSection title="Button" description="Buttons trigger actions. They have defined variants and states to communicate their purpose and interactivity.">
                        <ComponentDisplay title="Light Mode Variants">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </ComponentDisplay>
                        <div className="dark bg-background rounded-lg border border-border p-4">
                            <ComponentDisplay title="Dark Mode Variants">
                                <Button variant="primary">Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="link">Link</Button>
                            </ComponentDisplay>
                        </div>
                        <ComponentDisplay title="States">
                            <Button variant="primary" disabled>Disabled</Button>
                            <Button variant="secondary" disabled>Disabled</Button>
                        </ComponentDisplay>
                         <ComponentDisplay title="Sizes">
                            <Button variant="primary" size="lg">Large</Button>
                            <Button variant="primary" size="default">Default</Button>
                            <Button variant="primary" size="sm">Small</Button>
                            <Button variant="primary" size="icon"><i className="fa-solid fa-star"></i></Button>
                        </ComponentDisplay>
                        <CodeBlock language="tsx">
{`import { Button } from './ui/Button';

<Button variant="primary" size="lg" onClick={() => alert('Clicked!')}>
  Click Me
</Button>`}
                        </CodeBlock>
                    </SubSection>
                    
                    <SubSection title="Card" description="Cards are versatile containers for content and actions about a single subject. They group related information into a digestible format.">
                        <ComponentDisplay title="Standard Card">
                            <Card className="w-full max-w-sm">
                                <CardHeader>
                                    <h3 className="font-semibold">Standard Card Title</h3>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">The standard card has a subtle border and shadow. It's the default choice for most content containers, like email messages or settings panels.</p>
                                </CardContent>
                            </Card>
                        </ComponentDisplay>
                        <CodeBlock language="tsx">
{`import { Card, CardHeader, CardContent } from './ui/Card';

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content goes here.</CardContent>
</Card>`}
                        </CodeBlock>
                        
                        <ComponentDisplay title="Glass Card">
                            <GlassCard className="w-full max-w-sm p-6">
                                 <h3 className="font-semibold text-card-foreground">Glass Card Title</h3>
                                 <p className="text-card-foreground/80 mt-2">The Glass Card features a translucent, blurred background effect. It's used for special callouts or UI elements that float above the main content, like in the Design System's overview.</p>
                            </GlassCard>
                        </ComponentDisplay>
                        <CodeBlock language="tsx">
{`import { GlassCard } from './ui/GlassCard';

<GlassCard className="p-6">
  <h3>Title</h3>
  <p>Content goes here.</p>
</GlassCard>`}
                        </CodeBlock>
                    </SubSection>
                    
                     <SubSection title="Input" description="Inputs collect data from users. They include states for focus, error, and disabled.">
                        <ComponentDisplay title="States" className="flex-col !items-start max-w-sm w-full">
                            <Input placeholder="Default" />
                            <Input placeholder="Disabled" disabled />
                        </ComponentDisplay>
                         <CodeBlock language="tsx">
{`import { Input } from './ui/Input';

<Input type="email" placeholder="Enter your email" />`}
                        </CodeBlock>
                    </SubSection>

                    <SubSection title="Controls" description="Switches and Selects are used for settings and options.">
                         <ComponentDisplay title="Examples" className="flex-col !items-start max-w-sm w-full">
                            <div className="flex items-center space-x-4">
                                <ToggleSwitch checked={isChecked} onChange={setIsChecked} />
                                <span className="font-medium">Toggle Switch</span>
                            </div>
                            <Select>
                                <option>Option 1</option>
                                <option>Option 2</option>
                            </Select>
                        </ComponentDisplay>
                    </SubSection>
                </Section>
                
                <Section id="patterns" title="4. Pattern Library">
                     <SubSection title="Navigation" description="Consistent navigation is critical for user orientation. Our app uses a primary sidebar for module switching and a secondary sidebar for module-specific navigation.">
                        <Card className="p-4">
                            <p className="text-muted-foreground">The dual-sidebar pattern provides clear separation of concerns. The primary sidebar (far left) handles app-level navigation (Email, Chat, Drive), while the secondary sidebar provides context-specific options (Inbox, Sent, Drafts). This scales well from desktop to mobile, where the secondary sidebar can be overlaid or hidden.</p>
                        </Card>
                    </SubSection>
                    <SubSection title="Data Display" description="Information is presented in lists or cards. Lists are used for scannable rows of data (e.g., email list), while cards are used for grouped, distinct pieces of content (e.g., user profiles, settings sections).">
                         <Card className="p-4">
                            <p className="text-muted-foreground">The Email View uses a List for the inbox and a Detail View for the selected email. This Master-Detail pattern is responsive, collapsing to a single column on mobile.</p>
                        </Card>
                    </SubSection>
                    <SubSection title="Mobile Settings" description="Mobile settings screens use a consistent layout of sections, cards, and items to present information clearly and provide intuitive controls.">
                        <ComponentDisplay title="Example Settings Screen">
                            <div className="w-full space-y-4">
                                <SettingsSectionMobile title="General" />
                                <SettingsCardMobile>
                                    <SettingsItemMobile title="Manage folders" description="Show, hide, or reorder your mail folders." onClick={() => {}} />
                                    <div className="border-t border-border mx-4"></div>
                                    <SettingsItemMobile title="Dark mode" value="System" onClick={() => {}} />
                                    <div className="border-t border-border mx-4"></div>
                                    <SettingsItemMobile title="Auto fit content" hasToggle isToggleOn={true} onToggle={() => {}} />
                                </SettingsCardMobile>
                            </div>
                        </ComponentDisplay>
                        <CodeBlock language="tsx">
{`// These components are used to structure mobile settings screens.

const SettingsSection: React.FC<{ title: string }>;
const SettingsCard: React.FC<{ children: React.ReactNode }>;
const SettingsItem: React.FC<{
  title: string;
  description?: string;
  value?: string;
  hasToggle?: boolean;
  // ...and more props
}>;

<SettingsSection title="General" />
<SettingsCard>
    <SettingsItem title="Dark mode" value="System" onClick={...} />
    <SettingsItem title="Auto fit content" hasToggle isToggleOn={...} onToggle={...} />
</SettingsCard>
`}
                        </CodeBlock>
                    </SubSection>
                </Section>

                <Section id="accessibility" title="5. Accessibility Standards">
                     <SubSection title="Our Commitment" description="We design and build for everyone. Accessibility is not an afterthought; it's a core requirement for every component and feature.">
                        <GlassCard className="p-6">
                            <ul className="list-disc list-inside space-y-3 text-card-foreground">
                                <li><strong>Color Contrast:</strong> All text meets a minimum WCAG AA contrast ratio of 4.5:1.</li>
                                <li><strong>Keyboard Navigation:</strong> All interactive elements are focusable and operable via keyboard. Focus states are clear and consistent.</li>
                                <li><strong>Semantic HTML:</strong> We use correct HTML5 elements to ensure screen readers can interpret content structure.</li>
                                <li><strong>ARIA Roles:</strong> Appropriate ARIA attributes are used to enhance accessibility for complex components.</li>
                                <li><strong>Touch Targets:</strong> All interactive elements have a minimum touch target size of 44x44px for mobile usability.</li>
                            </ul>
                        </GlassCard>
                    </SubSection>
                </Section>
                 
                <Section id="technical" title="6. Technical Implementation">
                    <SubSection title="Connecting Design to Code" description="Our system uses design tokens to bridge the gap between Figma designs and the front-end codebase, ensuring consistency.">
                        <h4 className="font-semibold text-lg mb-2">Design Tokens</h4>
                        <p className="text-muted-foreground mb-4">Tokens are stored as CSS custom properties and are consumed by our Tailwind CSS configuration. This allows for global theme changes (like dark mode) with minimal code.</p>
                        <CodeBlock language="css">
{`:root {
  --background: 220 20% 98%;
  --foreground: 222.2 40% 20%;
  --primary: 219 85% 27%;
  /* ... etc */
}

.dark {
  --background: 224 20% 14%;
  --foreground: 210 40% 98%;
  --primary: 190 80% 50%;
  /* ... etc */
}`}
                        </CodeBlock>
                        <h4 className="font-semibold text-lg mt-6 mb-2">Tailwind Configuration</h4>
                        <p className="text-muted-foreground mb-4">The \`tailwind.config\` file maps these CSS variables to Tailwind's utility classes.</p>
                        <CodeBlock language="javascript">
{`tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        background: 'hsl(var(--background))',
        // ... etc
      },
    },
  },
};`}
                        </CodeBlock>
                         <h4 className="font-semibold text-lg mt-6 mb-2">Cross-Platform Alignment</h4>
                        <p className="text-muted-foreground mb-4">For desktop (.NET MAUI, Electron) and mobile (React Native, etc.), these web-based tokens serve as the source of truth. A script can transform these CSS variables into platform-specific formats (e.g., XAML ResourceDictionaries, Swift/Kotlin color assets) to ensure visual consistency across the entire product suite.</p>
                    </SubSection>
                </Section>
                
                <Section id="governance" title="7. Documentation & Governance">
                    <SubSection title="How We Work" description="Clear guidelines ensure the design system remains consistent and scalable.">
                        <ul className="list-disc list-inside space-y-4 text-muted-foreground">
                            <li><strong>Versioning:</strong> We follow Semantic Versioning (Major.Minor.Patch) for all changes to the system. Changelogs are maintained with every release.</li>
                            <li><strong>Contribution Process:</strong> New components or changes must be proposed via a design review, followed by a pull request. This ensures all additions meet our standards for design, code, and accessibility.</li>
                            <li><strong>Review Cycle:</strong> The core design system team meets quarterly to review feedback, plan the roadmap, and prioritize new components or updates.</li>
                            <li><strong>Team Roles:</strong> A core team of designers and developers are responsible for maintaining the system. All team members are encouraged to contribute.</li>
                        </ul>
                    </SubSection>
                </Section>
            </main>
        </div>
    );
};

export default DesignSystemView;