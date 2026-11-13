---
title: "Polymorph Stability at Finite Temperature"
subtitle: "How accurate must a machine-learned free energy be to place a phase transition?"
date: "2026-09"
authors:
  - "Ziren Jin"
  - name: "Duo Zhang"
    url: "https://scholar.google.com/citations?user=JQNv-AQAAAAJ&hl=en"
status: "Manuscript in preparation"
summary: "Machine-learned potentials follow atoms for nanoseconds; phase-field models need free energies that hold for hours. FES-Bench measures how accurate those free energies must be to place a phase transition, and where the remaining error comes from."
featured: true
order: 1
tags:
  - Machine Learning Interatomic Potential
  - Phase stability
  - Benchmark
  - Multi-scale modeling

links:
  code: "https://github.com/zirenjin/fes-bench"
---

**TL;DR**

- **Question.** How accurate must a machine-learned free energy be to place a polymorph transition? To land the median crossing within ±50 K, the error budget is about 0.4 meV/atom. An error of 1 meV/atom moves it by about 130 K.
- **Pretrained MLIPs miss most crossings.** DPA-3.1 and MatterSim, used without fine-tuning, place fewer than 1 in 10 of the 93 reference crossings (among 320 polymorph pairs) within ±50 K. A 30% lower single-phase error did not give a lower phase-relative error.
- **A small correction helps when data is enough.** A symmetry-constrained short-range force-constant correction on top of the MLIP raises the hit rate to 59% (DPA-3.1) and 46% (MatterSim) with full data. With a random quarter of the data, the gain is lost.
- **High-temperature phases need a different baseline.** Every bcc metal phase and high-temperature silica phase has imaginary modes under both models, so the harmonic baseline fails there. Next: take the baseline from the MLIP's own finite-temperature simulations.
- *Development results; numbers may change before publication.*

![Distributions of the reference free-energy difference, the crossing budget and model errors on a common logarithmic axis](./figures/error-scales.png "All the scales on one axis: the reference difference, the ±50 K budget, and the errors of DPA-3.1 and of a descriptor baseline. Development data.")

## The gap is in time, not size

We came up with this project while trying to answer how to get from atoms to the behaviour of a real material. It is tempting to think of this as a gap in length, from ångströms to millimetres. In materials simulation it is really a gap in **time**. Machine-learned interatomic potentials (MLIPs) follow atoms accurately over femtoseconds to nanoseconds, but a phase transformation at the macroscale often takes seconds to even hours. Faster molecular dynamics alone will not close a gap that size.

What can cross it is a short list of parameters. A phase-field model [1] does not need trajectories. It needs free energies, interface energies and mobilities. If the atomistic side can deliver those numbers very cheaply and with acceptable accuracy, the two scales connect.

## Current solutions

There are already several ways to get a free energy. Each one gives something up.

| Route | How it works | Good at | Gives up |
| --- | --- | --- | --- |
| Thermodynamic integration [2] | Molecular dynamics along a path to a reference system, at every temperature and pressure | Full anharmonicity; the reference method | Massive GPU costs |
| CALPHAD [3] | Gibbs-energy models fitted to experiments and calculations | Accurate and fast inside an assessed system | No extrapolation to new chemistries |
| Descriptor models [4, 5] | One fitted expression from volume, mass or composition | Instant, and applies to any material | Errors of tens of meV/atom |
| Phonons from pretrained MLIPs [6–9] | Phonons from a universal MLIP, then a harmonic or quasi-harmonic free energy | Cheap for thousands of structures | Misses anharmonicity [10]; validated one structure at a time [8] or at 0 K [11] |
| Corrected and thermodynamic MLIPs [12–14] | Tune an MLIP to reference data or known transitions, or target thermodynamics directly | Combines physics and data | Assume how large an error is acceptable |

We also know from formation energies that a small regression error does not guarantee a correct stability decision [15], and high-throughput Gibbs-energy methods have been checked against experimental thermochemistry [16]. Neither tells us what accuracy a phase crossing needs.

Put together, free-energy modelling has been moving from purely physics-driven methods towards physics and data working together. The aim is to keep physical accuracy while gaining speed and the ability to extrapolate to new materials. Our bet is to lean on the very high static accuracy of today's MLIPs. What we still have to figure out is how much thermodynamic information an MLIP's potential-energy surface actually carries, how to keep that information from getting lost in the difference between two phases, and how to extract it.

## The idea: let physics do most of the work

A free energy is $G = U - TS$. Modern MLIPs already give the static energy $U$ well, so the hard part is the entropy $S$. Our plan is to start from a cheap physical baseline, the harmonic or quasi-harmonic vibrational free energy computed from the MLIP's phonons, and to train a model only on the **residual** between the true free energy and that baseline. This is the Δ-learning idea [17] applied to free energies.

Why should the residual be easier to learn than the free energy itself? We made three assumptions:

- **It is small.** The baseline already carries almost all of the free energy and most of its temperature dependence. What is left is the MLIP's error in the curvature of the energy surface plus the anharmonic correction: a few meV/atom on a total of several eV/atom.
- **It is smooth.** As long as a phase stays mechanically stable, both parts change slowly with temperature, so a few reference points should pin down a whole curve.
- **It is local.** We expected the errors that matter to sit in short-range force constants, which a model with few parameters can describe.

These are assumptions, and FES-Bench is how we test them. It also answers a question that comes first: what does "accurate enough" mean?

## How accurate is accurate enough?

Which polymorph is stable is decided by the free-energy difference between competing phases, $\Delta G(T)$, and the transition sits where it crosses zero. Near the crossing $T_\times$, an error $e$ in $\Delta G$ moves the predicted transition by

$$
\delta T_\times \approx -\frac{e(T_\times)}{\Delta S(T_\times)}, \qquad \Delta S = -\frac{\partial \Delta G}{\partial T}.
$$

Silica shows how delicate this is. The difference between quartz and cristobalite is a few meV/atom out of about 8 eV/atom, and the curves cross at a shallow angle. Changing nothing but the exchange–correlation treatment of the DFT reference moves the crossing over about 670 K, and with LDA, PBE or r2SCAN there is no crossing in range at all [18].

![Silica free-energy differences and crossing temperatures under several exchange–correlation treatments](./figures/sio2-reference-sensitivity.png "Quartz–cristobalite and quartz–tridymite in silica under eight exchange–correlation treatments. (a) The free-energy difference is a few meV/atom. (b) Reference crossing temperatures; the grey band is ±50 K around PBE-D3(BJ). Reference data from [18].")

So a temperature tolerance only means something relative to a stated reference Hamiltonian. FES-Bench measures how faithfully a model reproduces its reference, not agreement with experiment.

Competing polymorphs have very similar entropies, so $\Delta S$ is tiny and $\Delta G(T)$ is nearly flat around the crossing. A small energy error therefore slides the crossing a long way. Turning a temperature tolerance $\tau$ into an energy budget gives $\varepsilon_\tau = \tau\,|\Delta S|$, which is different for every pair.

On our set of same-composition polymorph pairs, placing the median crossing within ±50 K needs about **0.4 meV/atom** of accuracy in the phase-relative free energy. Put the other way round, 1 meV/atom of error moves the median crossing by roughly 130 K. For scale, the typical free-energy difference between two such phases at 1000 K is about 8 meV/atom, and a good pretrained MLIP is off by about as much on each single phase. The figure at the top of this page puts all of these scales on one axis.

What does a budget of a few tenths of a meV/atom look like in practice? Silica again. We trained a small linear readout on top of a frozen DPA model to predict the free energy of β-cristobalite, a phase it never saw, from the reference free energies of two or three other silica phases. The readout uses DPA descriptors, the volume, or both.

With two source phases, the DPA readout has a mean error of 0.85 meV/atom and places the quartz-to-cristobalite transition 40 K from the reference. Adding a third source phase lowers the mean error to 0.32 meV/atom, yet the prediction now inserts a tridymite interval and makes cristobalite stable only at 1824 K, almost 300 K late. In one variant, cristobalite stays about 0.2 meV/atom above its competitors across the whole range and never becomes stable at all.

![Held-out β-cristobalite in silica: cristobalite margin against temperature, and the predicted stable phase for each readout](./figures/sio2-heldout-cristobalite.png#wide "β-cristobalite held out, PBE-D3(BJ) reference [18]. Top: the cristobalite margin, G(cristobalite) − min G(quartz, tridymite), with three source phases; below zero, cristobalite is stable. Bottom: the predicted stable phase against temperature for each readout, with the mean ΔG error, stable-phase accuracy and transitions hit / missed / false. Red bars mark a wrong stable phase. Development data.")

A lower average error did not give a better phase decision. What decides the outcome is the error right at the crossing, measured against the budget, and that is what FES-Bench scores.

## Where is the residual? Three stages

The residual idea only works if we know where the residual lives. A predicted transition temperature passes through several layers: the DFT reference, the MLIP's energy surface, the statistical mechanics (harmonic, quasi-harmonic or fully anharmonic), and the numerics. An error in any of them lands on the same crossing. So we built FES-Bench as three stages. Each one isolates a single question, moving from the most controlled setting to the most realistic one.

| Stage | Question | Data |
| --- | --- | --- |
| 1 | Is the MLIP's harmonic information right where it matters? | ~350 polymorph pairs with a common DFT phonon reference |
| 2 | Can a correction on top of the MLIP fix it, and how cheaply? | the same pairs, with the reference displacement forces as labels |
| 3 | Does it carry over to real finite-temperature transitions? | Ti, Zr, Hf and silica with full anharmonic reference free energies |

## Stage 1: Is the harmonic information right?

**Why.** Harmonic phonons are the cheapest thermodynamic information an MLIP gives, and they are the baseline of our residual plan. If they are already right in the difference between phases, the residual only has to carry anharmonicity. If they are wrong, the residual has to carry that error too, and we need to know where it sits. To see that, the test must change nothing but the energy surface.

**Design.** We took polymorph pairs from the Alexandria PBE phonon benchmark [8]: formulas with at least two entries flagged stable, minimum phonon frequency of at least −0.05 THz, duplicates removed. That leaves 239 formulas, 521 structures and 351 same-formula pairs, 320 of them with a trustworthy reference. The selection used only reference-side information and was fixed before any model was run. Each model then computes forces on exactly the displaced supercells the DFT reference used, and phonopy [9] turns them into force constants and harmonic free energies through the same code as the reference. For each phase we score

$$
G_p(T) = E_{0,p} + F^{\mathrm{harm}}_p(T), \qquad T = 0\text{–}1500\ \mathrm{K}.
$$

Keeping the DFT geometry separates errors in the energy surface from errors in geometry.

DPA-3.1 [6] and MatterSim [7] are evaluated without fine-tuning; MACE, UMA, eSEN and newer DPA versions are being added, with GPU time recorded for every run. Two information settings are scored: S0 uses no target thermodynamic labels, and S1 swaps in the reference static energy so that only the thermal error is left.

| Question | Metric |
| --- | --- |
| Accurate on each phase? | single-phase thermal error |
| Accurate on the difference? | phase-relative error, the share of error that cancels between phases, relative-entropy error |
| Right decision? | ordering, crossing within ±50 K, missed and spurious crossings |
| Defined at all? | a valid harmonic free energy (no imaginary modes) |
| Cost? | GPU time per prediction |

An invalid prediction counts as a failure, not as missing data. Uncertainties come from a paired bootstrap over formulas, and every analysis protocol is frozen, with a hash, before its results are computed.

**What we saw.** Getting each phase right does not get the difference right. Two widely used pretrained MLIPs, with single-phase thermal errors of 10–13 meV/atom, place fewer than one crossing in ten within ±50 K. Part of each model's error cancels between the two phases, but what is left is still several times the budget, and a model with 30% lower single-phase error was not shown to have a lower phase-relative error.

Most misses are offsets. In roughly two thirds of the crossings the model has the right sign of the entropy difference but sits at the wrong height, so the crossing slides. In about one in ten it gets the sign of the entropy difference wrong, which no constant shift can repair.

![Reference and predicted free-energy differences for three polymorph pairs](./figures/crossing-examples.png "Three kinds of outcome: a crossing placed within tolerance, a crossing shifted by an offset, and a wrong sign of the entropy difference. Development data.")

The soft modes decide. At high temperature the harmonic free energy depends on the logarithm of the phonon frequencies, so a spurious softening of a few low-frequency modes in one polymorph shifts that phase by tens of meV/atom while its competitor stays put. Errors averaged over all modes hide this; the soft part of the spectrum has to be checked phase by phase.

Sometimes the baseline does not exist. For about one pair in five, a model predicts imaginary phonon modes where the reference has none, and the harmonic free energy is simply undefined.

## Stage 2: Can a correction fix it?

**Why.** Stage 1 points to the error: low-frequency, phase-specific curvature of the energy surface. If that is right, a correction to the MLIP's force constants should repair it. Two questions have to be kept apart. Can the correction represent the missing accuracy at all? And does it need fewer reference calculations than simply computing the phonons with DFT? Only a yes to the second makes it useful.

**Design.** We tried the simplest fixes first. A learned per-phase offset lowers the error at the crossing but adds spurious crossings, and a uniform frequency scale does not improve the ordering. We then added a symmetry-constrained correction to the short-range force constants [21] on top of the MLIP, with a median of 189 parameters per phase within about 5 Å. To test capacity, it is fitted to all of a phase's reference displacement forces. To test cost, it is fitted to random 10%, 25% and 50% subsets, tuned by nested cross-validation over formulas, and compared with the uncorrected model and with the same correction without the MLIP underneath.

**What we saw.** The capacity is there. With complete data the correction cuts the pair thermal error of DPA-3.1 from 6.3 to 1.0 meV/atom and raises the share of crossings within ±50 K from 12% to 59% (15% to 46% for MatterSim). Without the MLIP the same correction mostly fails, because it lacks the long-range curvature that the MLIP supplies. So the residual is small and local, as we assumed.

The saving is not there yet. With a random quarter of the data, cross-validation picks the strongest regularisation and the correction effectively switches itself off. The labels pin down only about two thirds of the parameter directions, and the error left in the rest is about ten times the budget. Being small does not make the residual cheap to learn; **where** the reference data are taken matters. That is what we are testing now: choosing displacements by how much they move the crossing, starting from the soft modes, under a protocol frozen before the results.

## Stage 3: Does it carry over to real transitions?

**Why.** Stages 1 and 2 stay inside a harmonic proxy at the DFT geometry. Real transitions involve anharmonicity, the model's own geometry, and phases that only exist at high temperature. We need to know whether the conclusions hold there, and where the harmonic route itself breaks.

**Design.** Ti, Zr and Hf (hcp and bcc, from thermodynamic integration [19]) and silica (β-quartz, β-cristobalite and P6₃/mmc tridymite, at PBE and PBE-D3(BJ) [18]) have full reference free energies and documented transitions between 976 and 1919 K. Each model relaxes the structures itself and runs the same pipeline as in Stage 1. Three fixed splits say which reference labels a correction may use: labels below the transition only, leave one phase out, and leave one metal out. Fe, TiO₂, CaSiO₃, MgSiO₃ and C are being added under the same rules.

**What we saw.** Here the harmonic route does not just lose accuracy; it has no answer. Every bcc phase and every high-temperature silica phase has imaginary modes of 0.8–4.0 THz under both models, because these phases are held up only by anharmonic fluctuations. Dropping the imaginary branches misses each crossing by 45 to 430 times its budget, and none of the splits repairs that. On top of this, silica shows that the reference level alone moves a crossing by hundreds of kelvin.

For these phases the baseline itself has to change. It must come from the MLIP's own finite-temperature simulations, for example temperature-dependent effective potentials [20] or thermodynamic integration, with the residual learned on top. That is the piece that connects FES-Bench to the bigger goal: a pipeline that carries parameters from atomistic machine learning up to mesoscale continuum models.

## Status

Manuscript in preparation. The numbers on this page are development results on data we have already inspected, and they may change before publication. Data, stored predictions and scoring code will be released with the paper.

## Contributions

I lead FES-Bench: the benchmark design, the pipeline, the experiments and analysis, and the manuscript. Duo Zhang is my main discussion partner on the project and provides the GPU time.

## References

1. L.-Q. Chen, Phase-field models for microstructure evolution, *Annu. Rev. Mater. Res.* **32**, 113–140 (2002). [doi:10.1146/annurev.matsci.32.112001.132041](https://doi.org/10.1146/annurev.matsci.32.112001.132041)
2. B. Grabowski *et al.*, Ab initio vibrational free energies including anharmonicity for multicomponent alloys, *npj Comput. Mater.* **5**, 80 (2019). [doi:10.1038/s41524-019-0218-8](https://doi.org/10.1038/s41524-019-0218-8)
3. H. L. Lukas, S. G. Fries and B. Sundman, *Computational Thermodynamics: The Calphad Method* (Cambridge University Press, 2007).
4. C. J. Bartel *et al.*, Physical descriptor for the Gibbs energy of inorganic crystalline solids and temperature-dependent materials chemistry, *Nat. Commun.* **9**, 4168 (2018). [doi:10.1038/s41467-018-06682-4](https://doi.org/10.1038/s41467-018-06682-4)
5. F. Legrain *et al.*, How chemical composition alone can predict vibrational free energies and entropies of solids, *Chem. Mater.* **29**, 6220–6227 (2017). [doi:10.1021/acs.chemmater.7b00789](https://doi.org/10.1021/acs.chemmater.7b00789)
6. D. Zhang *et al.*, A graph neural network for the era of large atomistic models, arXiv:2506.01686 (2025). (DPA-3)
7. H. Yang *et al.*, MatterSim: a deep learning atomistic model across elements, temperatures and pressures, arXiv:2405.04967 (2024).
8. A. Loew, D. Sun, H.-C. Wang, S. Botti and M. A. L. Marques, Universal machine learning interatomic potentials are ready for phonons, *npj Comput. Mater.* **11**, 178 (2025). [doi:10.1038/s41524-025-01650-1](https://doi.org/10.1038/s41524-025-01650-1)
9. A. Togo, L. Chaput, T. Tadano and I. Tanaka, Implementation strategies in phonopy and phono3py, *J. Phys.: Condens. Matter* **35**, 353001 (2023).
10. V. Kapil, E. Engel, M. Rossi and M. Ceriotti, Assessment of approximate methods for anharmonic free energies, *J. Chem. Theory Comput.* **15**, 5845–5857 (2019). [doi:10.1021/acs.jctc.9b00596](https://doi.org/10.1021/acs.jctc.9b00596)
11. J. Riebesell *et al.*, A framework to evaluate machine learning crystal stability predictions, *Nat. Mach. Intell.* **7**, 836–847 (2025). [doi:10.1038/s42256-025-01055-1](https://doi.org/10.1038/s42256-025-01055-1)
12. S. Thaler and J. Zavadlav, Learning neural network potentials from experimental data via differentiable trajectory reweighting, *Nat. Commun.* **12**, 6884 (2021). [doi:10.1038/s41467-021-27241-4](https://doi.org/10.1038/s41467-021-27241-4)
13. P. Fuchs and J. Zavadlav, Refining machine learning potentials through thermodynamic theory of phase transitions, arXiv:2512.03974 (2025).
14. J. Nam *et al.*, Universal thermodynamic interatomic potentials for crystalline materials, arXiv:2608.14502 (2026).
15. C. J. Bartel *et al.*, A critical examination of compound stability predictions from machine-learned formation energies, *npj Comput. Mater.* **6**, 97 (2020). [doi:10.1038/s41524-020-00362-y](https://doi.org/10.1038/s41524-020-00362-y)
16. R. Fromsejer, B. Maribo-Mogensen, G. M. Kontogeorgis and X. Liang, Performance assessment of high-throughput Gibbs free energy predictions of crystalline solids, *Comput. Mater. Sci.* **252**, 113770 (2025). [doi:10.1016/j.commatsci.2025.113770](https://doi.org/10.1016/j.commatsci.2025.113770)
17. R. Ramakrishnan, P. O. Dral, M. Rupp and O. A. von Lilienfeld, Big data meets quantum chemistry approximations: the Δ-machine learning approach, *J. Chem. Theory Comput.* **11**, 2087–2096 (2015). [doi:10.1021/acs.jctc.5b00099](https://doi.org/10.1021/acs.jctc.5b00099)
18. A. Forslund, J. H. Jung, Y. Ikeda and B. Grabowski, Free-energy perturbation in the exchange-correlation space accelerated by machine learning: application to silica polymorphs, *npj Comput. Mater.* **12**, 14 (2026). [doi:10.1038/s41524-025-01874-1](https://doi.org/10.1038/s41524-025-01874-1); data: [DaRUS-4999](https://doi.org/10.18419/DARUS-4999)
19. J. H. Jung, A. Forslund, P. Srinivasan and B. Grabowski, Dynamically stabilized phases with full ab initio accuracy: thermodynamics of Ti, Zr, Hf with a focus on the hcp-bcc transition, *Phys. Rev. B* **108**, 184107 (2023). [doi:10.1103/PhysRevB.108.184107](https://doi.org/10.1103/PhysRevB.108.184107); data: [DaRUS-3582](https://doi.org/10.18419/darus-3582)
20. F. Knoop *et al.*, TDEP: temperature dependent effective potentials, *J. Open Source Softw.* **9**, 6150 (2024). [doi:10.21105/joss.06150](https://doi.org/10.21105/joss.06150)
21. F. Eriksson, E. Fransson and P. Erhart, The hiPhive package for the extraction of high-order force constants by machine learning, *Adv. Theory Simul.* **2**, 1800184 (2019). [doi:10.1002/adts.201800184](https://doi.org/10.1002/adts.201800184)
