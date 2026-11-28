import { lazy, Suspense } from 'react'
import type { AnimationName, Block } from '../content/types'
import { ACCENT } from '../lib/accent'
import { publicUrl } from '../lib/publicUrl'
import { RichText, tex } from './RichText'

const AtomShells = lazy(() => import('./AtomShells'))
const PeriodicTable = lazy(() => import('./PeriodicTable'))
const OrbitalCells = lazy(() => import('./OrbitalCells'))
const ElementCard = lazy(() => import('./ElementCard'))
const PeriodicTrends = lazy(() => import('./PeriodicTrends'))
const IonFormation = lazy(() => import('./IonFormation'))
const IonCells = lazy(() => import('./IonCells'))
const ExcitedStates = lazy(() => import('./ExcitedStates'))
const BondFormation = lazy(() => import('./BondFormation'))
const BondTypes = lazy(() => import('./BondTypes'))
const RustNails = lazy(() => import('./RustNails'))
const ClassTree = lazy(() => import('./ClassTree'))
const FormulaReader = lazy(() => import('./FormulaReader'))
const OxideTests = lazy(() => import('./OxideTests'))
const OxideSolubility = lazy(() => import('./OxideSolubility'))
const OxideHydroxide = lazy(() => import('./OxideHydroxide'))
const Indicators = lazy(() => import('./Indicators'))
const AcidStructure = lazy(() => import('./AcidStructure'))
const SaltBuilder = lazy(() => import('./SaltBuilder'))
const ActivitySeries = lazy(() => import('./ActivitySeries'))
const ReactionMechanism = lazy(() => import('./ReactionMechanism'))
const ReactionMatrix = lazy(() => import('./ReactionMatrix'))
const FlameTest = lazy(() => import('./FlameTest'))
const MetalIon = lazy(() => import('./MetalIon'))
const NonmetalMatrix = lazy(() => import('./NonmetalMatrix'))
const MechanismSwitcher = lazy(() => import('./MechanismSwitcher'))
const HalogenAtoms = lazy(() => import('./HalogenAtoms'))
const HalogenTrends = lazy(() => import('./HalogenTrends'))
const HalogenMolecule = lazy(() => import('./HalogenMolecule'))
const HalogenTubes = lazy(() => import('./HalogenTubes'))
const ChlorineLab = lazy(() => import('./ChlorineLab'))
const HalogenMechanisms = lazy(() => import('./HalogenMechanisms'))
const HalogenDisplacement = lazy(() => import('./HalogenDisplacement'))
const HalideTest = lazy(() => import('./HalideTest'))
const ChalcogenAtoms = lazy(() => import('./ChalcogenAtoms'))
const OzoneDischarge = lazy(() => import('./OzoneDischarge'))
const SulfurHeating = lazy(() => import('./SulfurHeating'))
const OxygenLab = lazy(() => import('./OxygenLab'))
const OxygenBurning = lazy(() => import('./OxygenBurning'))
const ChalcogenMechanisms = lazy(() => import('./ChalcogenMechanisms'))
const SulfurRoles = lazy(() => import('./SulfurRoles'))
const PnictogenAtoms = lazy(() => import('./PnictogenAtoms'))
const PnictogenMolecules = lazy(() => import('./PnictogenMolecules'))
const PnictogenMechanisms = lazy(() => import('./PnictogenMechanisms'))
const PnictogenRoles = lazy(() => import('./PnictogenRoles'))
const PhosphorusAmount = lazy(() => import('./PhosphorusAmount'))
const CarbonAtoms = lazy(() => import('./CarbonAtoms'))
const CarbonAllotropes = lazy(() => import('./CarbonAllotropes'))
const CharcoalAdsorption = lazy(() => import('./CharcoalAdsorption'))
const CarbonBurning = lazy(() => import('./CarbonBurning'))
const CarbonReduction = lazy(() => import('./CarbonReduction'))
const CarbonMechanisms = lazy(() => import('./CarbonMechanisms'))
const CarbonRoles = lazy(() => import('./CarbonRoles'))
const OxideMatrix = lazy(() => import('./OxideMatrix'))
const SaltRatio = lazy(() => import('./SaltRatio'))
const IonTests = lazy(() => import('./IonTests'))
const IonSearch = lazy(() => import('./IonSearch'))
const AmphotericExcess = lazy(() => import('./AmphotericExcess'))
const ElectrolyteTest = lazy(() => import('./ElectrolyteTest'))
const DipoleDemo = lazy(() => import('./WaterDipole').then((m) => ({ default: m.DipoleDemo })))
const HydrationDemo = lazy(() => import('./WaterDipole').then((m) => ({ default: m.HydrationDemo })))
const DissociationDegree = lazy(() => import('./DissociationDegree'))
const ClassesDemo = lazy(() => import('./DissociationClasses').then((m) => ({ default: m.ClassesDemo })))
const ExchangeMechanism = lazy(() => import('./IonEquations').then((m) => ({ default: m.MechanismDemo })))
const ExchangeConditions = lazy(() => import('./IonEquations').then((m) => ({ default: m.ConditionsDemo })))
const ExchangeWriting = lazy(() => import('./IonEquations').then((m) => ({ default: m.WritingDemo })))
const ExchangeEquations = lazy(() => import('./IonEquations').then((m) => ({ default: m.BuilderDemo })))
const RedoxTransfer = lazy(() => import('./RedoxDemos').then((m) => ({ default: m.TransferDemo })))
const RedoxShift = lazy(() => import('./RedoxDemos').then((m) => ({ default: m.ShiftDemo })))
const RedoxScale = lazy(() => import('./RedoxDemos').then((m) => ({ default: m.ScaleDemo })))
const RedoxBalance = lazy(() => import('./RedoxDemos').then((m) => ({ default: m.BalanceDemo })))
const RedoxComplex = lazy(() => import('./RedoxDemos').then((m) => ({ default: m.ComplexDemo })))
const StepwiseDemo = lazy(() => import('./DissociationClasses').then((m) => ({ default: m.StepwiseDemo })))
const ElementFraction = lazy(() => import('./MassFraction').then((m) => ({ default: m.ElementFractionDemo })))
const SolutionMixer = lazy(() => import('./MassFraction').then((m) => ({ default: m.SolutionMixerDemo })))
const FractionTriangle = lazy(() => import('./MassFraction').then((m) => ({ default: m.FractionTriangleDemo })))
const SolutionChanges = lazy(() => import('./MassFraction').then((m) => ({ default: m.SolutionChangesDemo })))

/** Светлый ли фон (hex) — тогда текст делаем тёмным */
function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
}

function Animation({ name }: { name: AnimationName }) {
  switch (name) {
    case 'atom-shells':
      return <AtomShells />
    case 'periodic-electrons':
      return <PeriodicTable mode="electrons" />
    case 'periodic-substances':
      return <PeriodicTable mode="substances" />
    case 'orbital-cells':
      return <OrbitalCells />
    case 'element-card':
      return <ElementCard />
    case 'periodic-trends':
      return <PeriodicTrends />
    case 'metal-ion':
      return <MetalIon />
    case 'react-nonmetals':
      return <NonmetalMatrix />
    case 'mech-switcher':
      return <MechanismSwitcher />
    case 'ion-formation':
      return <IonFormation />
    case 'ion-cells':
      return <IonCells />
    case 'excited-states':
      return <ExcitedStates />
    case 'bond-formation':
      return <BondFormation />
    case 'bond-types':
      return <BondTypes />
    case 'rust-nails':
      return <RustNails />
    case 'class-tree':
      return <ClassTree />
    case 'formula-reader':
      return <FormulaReader />
    case 'oxide-tests':
      return <OxideTests />
    case 'oxide-solubility':
      return <OxideSolubility />
    case 'oxide-hydroxide':
      return <OxideHydroxide />
    case 'indicators':
      return <Indicators />
    case 'acid-structure':
      return <AcidStructure />
    case 'salt-builder':
      return <SaltBuilder />
    case 'activity-series':
      return <ActivitySeries />
    case 'mech-nonmetals':
      return <ReactionMechanism group="nonmetals" />
    case 'mech-water':
      return <ReactionMechanism group="water" />
    case 'mech-acids':
      return <ReactionMechanism group="acids" />
    case 'mech-salts':
      return <ReactionMechanism group="salts" />
    case 'mech-oxides':
      return <ReactionMechanism group="oxides" />
    case 'react-matrix':
      return <ReactionMatrix />
    case 'flame-test':
      return <FlameTest />
    case 'halogen-atoms':
      return <HalogenAtoms />
    case 'excited-halogens':
      return <ExcitedStates symbols={['F', 'Cl']} />
    case 'halogen-trends':
      return <HalogenTrends />
    case 'halogen-molecule':
      return <HalogenMolecule />
    case 'halogen-tubes':
      return <HalogenTubes />
    case 'chlorine-lab':
      return <ChlorineLab />
    case 'halogen-mech-metals':
      return <HalogenMechanisms only="hal-metals" />
    case 'halogen-mech-nonmetals':
      return <HalogenMechanisms only="hal-nonmetals" />
    case 'halogen-mech-water':
      return <HalogenMechanisms only="hal-water" />
    case 'halogen-mech-displace':
      return <HalogenMechanisms only="hal-displace" />
    case 'halogen-displace':
      return <HalogenDisplacement />
    case 'halide-test':
      return <HalideTest />
    case 'chalcogen-atoms':
      return <ChalcogenAtoms />
    case 'excited-chalcogens':
      return <ExcitedStates symbols={['O', 'S']} />
    case 'ozone-discharge':
      return <OzoneDischarge />
    case 'sulfur-heating':
      return <SulfurHeating />
    case 'oxygen-lab':
      return <OxygenLab />
    case 'oxygen-burning':
      return <OxygenBurning />
    case 'chal-mech-oxygen':
      return <ChalcogenMechanisms only="chal-oxygen" />
    case 'chal-mech-sulfur':
      return <ChalcogenMechanisms only="chal-sulfur" />
    case 'sulfur-roles':
      return <SulfurRoles />
    case 'pnictogen-atoms':
      return <PnictogenAtoms />
    case 'excited-pnictogens':
      return <ExcitedStates symbols={['N', 'P']} />
    case 'pnictogen-molecules':
      return <PnictogenMolecules />
    case 'pn-mech-nitrogen':
      return <PnictogenMechanisms only="pn-nitrogen" />
    case 'pn-mech-phosphorus':
      return <PnictogenMechanisms only="pn-phosphorus" />
    case 'pnictogen-roles':
      return <PnictogenRoles />
    case 'phosphorus-amount':
      return <PhosphorusAmount />
    case 'carbon-atoms':
      return <CarbonAtoms />
    case 'excited-carbon':
      return <ExcitedStates symbols={['C', 'Si']} />
    case 'carbon-allotropes':
      return <CarbonAllotropes />
    case 'charcoal-adsorption':
      return <CharcoalAdsorption />
    case 'carbon-burning':
      return <CarbonBurning />
    case 'carbon-reduction':
      return <CarbonReduction />
    case 'cs-mech-carbon':
      return <CarbonMechanisms only="cs-carbon" />
    case 'cs-mech-silicon':
      return <CarbonMechanisms only="cs-silicon" />
    case 'carbon-roles':
      return <CarbonRoles />
    case 'oxide-matrix':
      return <OxideMatrix />
    case 'salt-ratio':
      return <SaltRatio />
    case 'ion-tests':
      return <IonTests />
    case 'ion-search':
      return <IonSearch />
    case 'amphoteric-excess':
      return <AmphotericExcess />
    case 'electrolyte-test':
      return <ElectrolyteTest />
    case 'water-dipole':
      return <DipoleDemo />
    case 'hydration':
      return <HydrationDemo />
    case 'dissociation-degree':
      return <DissociationDegree />
    case 'dissociation-classes':
      return <ClassesDemo />
    case 'stepwise-dissociation':
      return <StepwiseDemo />
    case 'exchange-mechanism':
      return <ExchangeMechanism />
    case 'exchange-conditions':
      return <ExchangeConditions />
    case 'exchange-writing':
      return <ExchangeWriting />
    case 'exchange-equations':
      return <ExchangeEquations />
    case 'redox-transfer':
      return <RedoxTransfer />
    case 'redox-shift':
      return <RedoxShift />
    case 'redox-scale':
      return <RedoxScale />
    case 'redox-balance':
      return <RedoxBalance />
    case 'redox-complex':
      return <RedoxComplex />
    case 'element-fraction':
      return <ElementFraction />
    case 'solution-mixer':
      return <SolutionMixer />
    case 'fraction-triangle':
      return <FractionTriangle />
    case 'solution-changes':
      return <SolutionChanges />
  }
}

const TONES = {
  remember: { bg: 'bg-teal/10', bar: 'bg-teal', title: 'text-teal', label: 'Запомни' },
  tip: { bg: 'bg-blue/10', bar: 'bg-blue', title: 'text-blue', label: 'Совет' },
  warn: { bg: 'bg-orange/15', bar: 'bg-orange', title: 'text-[#b8740a]', label: 'Ловушка' },
}

const COLS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }

export function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'split':
      return (
        <div
          className="grid items-start gap-4 lg:[grid-template-columns:var(--left)_minmax(0,1fr)]"
          style={{ '--left': `${block.leftWidth ?? 460}px` } as React.CSSProperties}
        >
          <div className="min-w-0 space-y-4">
            {block.left.map((x, i) => (
              <BlockView key={i} block={x} />
            ))}
          </div>
          <div className="min-w-0 space-y-3">
            {block.right.map((x, i) => (
              <BlockView key={i} block={x} />
            ))}
          </div>
        </div>
      )
    case 'heading':
      return (
        <h3 id={block.id} className={`pt-2 text-xl font-bold text-navy${block.id ? ' scroll-mt-24' : ''}`}>
          {block.text}
        </h3>
      )
    case 'text':
      return (
        <p className="text-[17px] leading-relaxed">
          <RichText text={block.text} />
        </p>
      )
    case 'callout': {
      const t = TONES[block.tone]
      return (
        <div className={`flex overflow-hidden rounded-xl ${t.bg}`}>
          <div className={`w-1.5 shrink-0 ${t.bar}`} />
          <div className="p-4">
            <div className={`mb-1 text-sm font-bold uppercase tracking-wide ${t.title}`}>{block.title ?? t.label}</div>
            <div className="leading-relaxed">
              <RichText text={block.text} />
            </div>
          </div>
        </div>
      )
    }
    case 'equation':
      return (
        <div
          className="overflow-x-auto rounded-xl bg-white px-3 py-3 text-center text-[15px] shadow-sm sm:px-4 sm:text-xl"
          dangerouslySetInnerHTML={{ __html: tex(block.tex, true) }}
        />
      )
    case 'cards':
      return (
        <div className={`grid gap-3 ${COLS[block.cols ?? 2]}`}>
          {block.items.map((c, i) => {
            const a = ACCENT[c.tone]
            return (
              <div key={i} className="flex overflow-hidden rounded-xl bg-white shadow-sm">
                <div className={`w-1.5 shrink-0 ${a.bg}`} />
                <div className="min-w-0 flex-1 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                    <div className={`font-bold ${a.text}`}>{c.title}</div>
                    {c.tag && <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${a.soft} ${a.text}`}>{c.tag}</span>}
                  </div>
                  {c.text && (
                    <div className="mt-1 min-w-0 overflow-x-auto leading-relaxed">
                      <RichText text={c.text} />
                    </div>
                  )}
                  {c.list && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 leading-relaxed">
                      {c.list.map((li, k) => (
                        <li key={k} className="min-w-0">
                          <RichText text={li} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.example && (
                    <div className={`mt-2 min-w-0 overflow-x-auto rounded-lg px-3 py-1.5 text-sm ${a.soft}`}>
                      <RichText text={c.example} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    case 'steps': {
      const n = block.items.length
      const cols = n <= 2 ? 'sm:grid-cols-2' : n === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'
      return (
        <ol className={`grid gap-3 ${cols}`}>
          {block.items.map((s, i) => (
            <li key={i} className="min-w-0 rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple text-sm font-bold text-white">{i + 1}</div>
              <div className="font-bold">{s.title}</div>
              <div className="mt-1 min-w-0 overflow-x-auto text-sm leading-relaxed">
                <RichText text={s.text} />
              </div>
            </li>
          ))}
        </ol>
      )
    }
    case 'animation':
      return (
        <div className="min-w-0 max-w-full overflow-x-clip">
          <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-navy/10" />}>
            <Animation name={block.name} />
          </Suspense>
        </div>
      )
    case 'image':
      return (
        <figure
          className="mx-auto overflow-hidden rounded-xl bg-white shadow-sm"
          style={block.maxWidth ? { maxWidth: block.maxWidth } : undefined}
        >
          <img src={publicUrl(block.src)} alt={block.alt} loading="lazy" className="w-full" />
          {block.caption && <figcaption className="px-4 py-2 text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      )
    case 'gallery':
      return (
        <figure className="rounded-xl bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            {block.items.map((it) => (
              <div key={it.src} className="overflow-hidden rounded-lg bg-paper">
                <img src={publicUrl(it.src)} alt={it.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold leading-tight">{it.title}</div>
                    {it.tag && <span className="shrink-0 rounded-md bg-orange/20 px-1.5 text-sm font-extrabold text-navy">{it.tag}</span>}
                  </div>
                  {it.formula && (
                    <div className="mt-1.5 inline-block rounded-lg bg-navy px-2.5 py-1 text-base font-extrabold tracking-wide text-orange">{it.formula}</div>
                  )}
                  {it.caption && <div className="mt-0.5 text-sm leading-snug text-muted">{it.caption}</div>}
                </div>
              </div>
            ))}
          </div>
          {block.caption && <figcaption className="px-1 pt-2 text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      )
    case 'video':
      return (
        <figure>
          <video controls preload="metadata" poster={block.poster ? publicUrl(block.poster) : undefined} className="w-full rounded-xl bg-black">
            <source src={publicUrl(block.src)} />
          </video>
          {block.caption && <figcaption className="mt-1 text-sm text-muted">{block.caption}</figcaption>}
        </figure>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-navy text-white">
                {block.head.map((h, i) => (
                  <th key={i} className="px-4 py-2 font-semibold">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t border-paper">
                  {r.map((c, j) => {
                    const bg = block.cellColors?.[i]?.[j]
                    return (
                      <td
                        key={j}
                        className={`px-4 py-2 align-top${bg ? ' font-semibold' : ''}`}
                        style={bg ? { backgroundColor: bg, color: isLightColor(bg) ? '#1b2340' : '#fff' } : undefined}
                      >
                        <RichText text={c} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}
