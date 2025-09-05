/**
 * Example option lists.
 * Replace with your own domain data whenever ready.
 */
import type { Option } from "../types/options";


export const INTERVENTIONS: Option[] = [
  // ------------------------------
  // ACT
  // ------------------------------
  { id: "act-defusion-creative-engagement", group: "ACT", label: "Encouraged creative engagement with difficult thoughts using defusion tools." },
  { id: "act-urges-willingness-choice", group: "ACT", label: "Practiced identifying urges and impulses without acting on them, reinforcing willingness and choice." },
  { id: "act-review-refine-values-domains", group: "ACT", label: "Reviewed and refined values in multiple life domains to enhance clarity and direction." },
  { id: "act-acceptance-internal-discomfort", group: "ACT", label: "Supported acceptance of internal discomfort as a means to foster action aligned with the client’s chosen path." },
  { id: "act-metaphor-passengers-on-bus", group: "ACT", label: "Encouraged willingness by using metaphors (e.g., “Passengers on the Bus”) to reframe painful inner experiences." },
  { id: "act-choice-point", group: "ACT", label: "Used the “choice point” model to illustrate moments of alignment with or deviation from values." },
  { id: "act-barriers-to-committed-action", group: "ACT", label: "Processed barriers to values-based action and collaboratively developed steps for committed action." },
  { id: "act-perspective-taking", group: "ACT", label: "Conducted perspective taking activity to build awareness and flexibility." },
  { id: "act-explore-apply-values", group: "ACT", label: "Identified and explored values and ways the client does and can apply them meaningfully." },
  { id: "act-creative-hopelessness", group: "ACT", label: "Conducted creative hopelessness activity to highlight benefits and costs of experiential avoidance." },
  { id: "act-defusion-during-discomfort", group: "ACT", label: "Conducted defusion activity to support cognitive flexibility during uncomfortable thoughts." },

  // ------------------------------
  // CBT
  // ------------------------------
  { id: "cbt-relationship-between-thoughts-feelings-actions", group: "CBT", label: "Identified thoughts, feelings and actions and explored the relationship between them." },
  { id: "cbt-thinking-traps", group: "CBT", label: "Identified and reframed thinking traps." },
  { id: "cbt-anxiety-cycle-maintaining-factors", group: "CBT", label: "Discussed anxiety cycle and explored factors and patterns maintaining client's anxiety." },
  { id: "cbt-exposure-habituate-anxiety", group: "CBT", label: "Conducted exposure activity to habituate client's anxiety." },
  { id: "cbt-behavioural-experiment", group: "CBT", label: "Planned behavioural experiment to support curious exploration of possibilities." },
  { id: "cbt-behavioural-activation", group: "CBT", label: "Conducted behavioural activation activity to support meaningful engagement with positive experiences." },
  { id: "cbt-interoceptive-exposure", group: "CBT", label: "Practiced interoceptive exposure to increase tolerance and flexibility in responding to bodily sensations." },
  { id: "cbt-identify-emotion-driven-behaviours", group: "CBT", label: "Identified emotion-driven behaviors and explored alternative, values-congruent responses." },
  { id: "cbt-cognitive-reappraisal", group: "CBT", label: "Practiced cognitive reappraisal strategies to challenge maladaptive appraisals and increase emotional flexibility." },
  { id: "cbt-situational-exposure-post-reflection", group: "CBT", label: "Conducted situational exposure activity targeting emotional triggers and supported post-exposure reflection." },

  // ------------------------------
  // General
  // ------------------------------
  { id: "gen-listened-empathy-validation", group: "General", label: "Listened actively, providing empathy and validation." },
  { id: "gen-strengths-resilience-planning", group: "General", label: "Identified strengths and resilience factors and integrated them into ongoing conceptualization and planning." },
  { id: "gen-generalization-planning-real-world", group: "General", label: "Supported generalization of skills through collaborative planning for real-world application of emotional coping strategies." },
  { id: "gen-reflected-in-session-reactions", group: "General", label: "Reflected on client’s emotional reactions in-session to deepen awareness of meaningful elements and create openness to them." },
  { id: "gen-validated-lived-experience", group: "General", label: "Validated client's lived experience and cultivated a nonjudgmental space to hold ambiguity and complexity." },
  { id: "gen-authenticity-alignment-values", group: "General", label: "Encouraged reflection on authenticity and alignment with deeply held values and beliefs." },
  { id: "gen-agency-responsibility-choice", group: "General", label: "Discussed the client's evolving sense of self in relation to agency, responsibility, and choice." },
  { id: "gen-therapeutic-relationship-connection-rupture-repair", group: "General", label: "Used the therapeutic relationship as a space to explore patterns of connection, rupture, and repair." },
  { id: "gen-congruence-incongruence-self-concept-actions", group: "General", label: "Highlighted moments of congruence and incongruence between client’s self-concept and actions." },
  { id: "gen-empathic-confrontation", group: "General", label: "Used empathic confrontation to gently highlight discrepancies between stated goals and current behavior." },
  { id: "gen-identify-emotional-blocks", group: "General", label: "Supported identification of emotional blocks that disrupt access to core affect and relational longings." },
  { id: "gen-review-scope-goals-structure", group: "General", label: "Reviewed the scope, goals, and structure of therapy and invited client questions or clarifications." },
  { id: "gen-confidentiality-limits", group: "General", label: "Revisited limits of confidentiality in response to client concerns or as clinically appropriate." },
  { id: "gen-risks-benefits-alternatives", group: "General", label: "Discussed potential risks, benefits, and alternatives to proposed interventions or approaches." },
  { id: "gen-cancellations-emergencies-after-hours", group: "General", label: "Reviewed procedures for session cancellations, emergencies, and after-hours." },
  { id: "gen-roles-boundaries-scope-of-practice", group: "General", label: "Clarified therapist roles, boundaries, and scope of practice in response to client queries or changing needs." },
  { id: "gen-acknowledged-emotional-impact-supported", group: "General", label: "Acknowledged and discussed the emotional impact of therapeutic content and ensured client felt supported in proceeding." },

  // ------------------------------
  // DBT
  // ------------------------------
  { id: "dbt-emotion-regulation-strategies", group: "DBT", label: "Reviewed emotion regulation strategies (e.g., opposite action, behavioral activation) to support adaptive coping." },
  { id: "dbt-mindfulness-what-how", group: "DBT", label: "Taught and reviewed mindfulness “What” and “How” skills to enhance awareness and reduce reactivity." },
  { id: "dbt-distress-tolerance-tools", group: "DBT", label: "Facilitated application of distress tolerance tools (e.g., ACCEPTS, self-soothe, TIP skills) during emotional crises." },
  { id: "dbt-emotional-vulnerability-factors", group: "DBT", label: "Reviewed emotional vulnerability factors and introduced emotion regulation strategies for proactive coping." },
  { id: "dbt-interpersonal-effectiveness-assertive-roleplay", group: "DBT", label: "Explored interpersonal effectiveness skills and practiced assertive communication in role-play." },
  { id: "dbt-therapy-interfering-behaviour", group: "DBT", label: "Processed instances of therapy-interfering behavior using nonjudgmental stance and validation." },
  { id: "dbt-promoted-skills-generalization", group: "DBT", label: "Promoted skills generalization by linking session content to real-world application." },

  // ------------------------------
  // RO-DBT
  // ------------------------------
  { id: "rodbt-overcontrol-concept-impact", group: "RO-DBT", label: "Introduced the concept of overcontrol (OC) and explored its impact on interpersonal functioning and emotional expression." },
  { id: "rodbt-social-signaling-techniques", group: "RO-DBT", label: "Practiced social signaling techniques to increase openness and engagement in interpersonal contexts." },
  { id: "rodbt-diary-cards-self-enquiry", group: "RO-DBT", label: "Encouraged self-enquiry using RO-DBT diary cards to reflect on urges, emotions, and social behavior." },
  { id: "rodbt-maladaptive-perfectionism", group: "RO-DBT", label: "Facilitated discussion on the function of maladaptive perfectionism and inhibited emotional expression." },
  { id: "rodbt-flexible-mind-varies", group: "RO-DBT", label: "Taught and practiced the skill of “flexible mind VARIES” to support openness to new experiences." },
  { id: "rodbt-biosocial-theory-overcontrol", group: "RO-DBT", label: "Reviewed biosocial theory of overcontrol to normalize temperament-driven difficulties with emotional expression." },

  // ------------------------------
  // Education – Anxiety
  // ------------------------------
  { id: "edu-anxiety-physio-cog-beh-components", group: "Edu - Anxiety", label: "Provided education on the physiological, cognitive, and behavioral components of anxiety." },
  { id: "edu-anxiety-avoidance-safety-behaviours", group: "Edu - Anxiety", label: "Explained the role of avoidance and safety behaviors in maintaining anxiety cycles." },
  { id: "edu-anxiety-amygdala-threat-system", group: "Edu - Anxiety", label: "Discussed the role of the amygdala and threat system in anxiety response." },
  { id: "edu-anxiety-exposure-concept", group: "Edu - Anxiety", label: "Introduced the concept of exposure as a pathway to tolerance and flexibility." },

  // ------------------------------
  // Education – ADHD
  // ------------------------------
  { id: "edu-adhd-executive-function-psychoeducation", group: "Edu - ADHD", label: "Provided psychoeducation on executive function deficits and their impact on focus, memory, and organization." },
  { id: "edu-adhd-emotional-relational-impacts", group: "Edu - ADHD", label: "Discussed common emotional and relational impacts of ADHD across the lifespan." },
  { id: "edu-adhd-task-initiation-attention", group: "Edu - ADHD", label: "Normalized difficulty with task initiation and sustained attention as neurobiological challenges." },
  { id: "edu-adhd-external-structure-time-goals", group: "Edu - ADHD", label: "Introduced practical strategies for external structure, time management, and goal-setting." },
];



export const OBSERVATIONS: Option[] = [
  // ------------------------------
  // Observations of Client Affect
  // ------------------------------
  { id: "affect-resistant-hesitant", group: "Observations of Client Affect", label: "Client appeared initially resistant or hesitant to engage in the intervention." },
  { id: "affect-skeptical-technique", group: "Observations of Client Affect", label: "Client expressed skepticism about the relevance or helpfulness of the technique." },
  { id: "affect-became-emotional", group: "Observations of Client Affect", label: "Client became visibly emotional during processing." },
  { id: "affect-struggled-identify", group: "Observations of Client Affect", label: "Client struggled to identify thoughts/feelings during the intervention." },
  { id: "affect-intellectualized", group: "Observations of Client Affect", label: "Client intellectualized or shifted focus away from core content." },
  { id: "affect-relief-insight", group: "Observations of Client Affect", label: "Client reported a sense of relief or insight following the intervention." },
  { id: "affect-confusion-purpose", group: "Observations of Client Affect", label: "Client demonstrated confusion about the purpose of the task." },
  { id: "affect-engaged-deeply", group: "Observations of Client Affect", label: "Client engaged deeply with the intervention and reported meaningful resonance." },
  { id: "affect-minimized-reaction", group: "Observations of Client Affect", label: "Client minimized their emotional reaction or dismissed insights gained." },
  { id: "affect-shame-self-criticism", group: "Observations of Client Affect", label: "Client experienced shame or self-criticism in response to a personal realization." },
  { id: "affect-breakthrough-insight", group: "Observations of Client Affect", label: "Client verbalized a breakthrough insight about a long-standing pattern." },
  { id: "affect-dysregulated-exposure", group: "Observations of Client Affect", label: "Client became dysregulated during exposure/emotionally evocative work." },
  { id: "affect-mismatch-content-affect", group: "Observations of Client Affect", label: "Client exhibited a mismatch between content and affect." },
  { id: "affect-tearful-choked-up", group: "Observations of Client Affect", label: "Client appeared tearful or choked up when discussing emotionally salient content." },
  { id: "affect-frustration-irritability", group: "Observations of Client Affect", label: "Client expressed visible frustration or irritability." },
  { id: "affect-tense-vulnerable-moments", group: "Observations of Client Affect", label: "Client became visibly tense (e.g., clenched jaw, crossed arms) during emotionally vulnerable moments." },
  { id: "affect-shifted-rapidly", group: "Observations of Client Affect", label: "Client's affect shifted rapidly." },
  { id: "affect-increased-expressiveness", group: "Observations of Client Affect", label: "Client demonstrated increased emotional expressiveness over the course of the session." },
  { id: "affect-named-with-specificity", group: "Observations of Client Affect", label: "Client named emotions with increased specificity or depth." },
  { id: "affect-avoidance-of-affect", group: "Observations of Client Affect", label: "Client demonstrated avoidance of affect through abrupt topic shifts/rationalization." },
  { id: "affect-blunted-dissociative", group: "Observations of Client Affect", label: "Client's emotional expression seemed blunted or dissociative." },
  { id: "affect-curiosity-openness", group: "Observations of Client Affect", label: "Client demonstrated curiosity or openness toward difficult emotions." },
  { id: "affect-calm-after-disclosure", group: "Observations of Client Affect", label: "Client displayed moments of calm or grounding after emotional disclosure." },

  // ------------------------------
  // Therapist Response
  // ------------------------------
  { id: "tx-validated-ambivalence", group: "Therapist Response", label: "Therapist validated ambivalence and invited exploration of underlying fears or beliefs." },
  { id: "tx-acknowledged-doubt-linked-goals", group: "Therapist Response", label: "Therapist acknowledged doubt and linked intervention to identified goals or values." },
  { id: "tx-attunement-normalized-emotion", group: "Therapist Response", label: "Therapist remained present, offered attunement, and normalized the depth of emotion." },
  { id: "tx-modeled-curiosity-prompts", group: "Therapist Response", label: "Therapist modeled curiosity and used gentle prompts to facilitate connection to internal experience." },
  { id: "tx-redirected-to-emotion", group: "Therapist Response", label: "Therapist gently redirected to emotional experience with compassion and nonjudgment." },
  { id: "tx-reinforced-integration", group: "Therapist Response", label: "Therapist reinforced integration by reflecting on the significance and linking to larger themes." },
  { id: "tx-clarified-intention-adjusted", group: "Therapist Response", label: "Therapist clarified intention, used metaphor or modeling, and adjusted approach collaboratively." },
  { id: "tx-highlighted-shift-mindful-reflection", group: "Therapist Response", label: "Therapist highlighted the shift and encouraged mindful reflection on the experience." },
  { id: "tx-explored-protective-functions", group: "Therapist Response", label: "Therapist explored possible protective functions and invited openness to complexity." },
  { id: "tx-compassion-focused", group: "Therapist Response", label: "Therapist used compassion-focused strategies and affirmed client’s courage in facing discomfort." },
  { id: "tx-highlighted-growth-consolidation", group: "Therapist Response", label: "Therapist highlighted growth, reinforced self-awareness, and supported consolidation of learning." },
  { id: "tx-contained-grounding-titrated", group: "Therapist Response", label: "Therapist contained session with grounding, co-regulation, and titrated pacing." },
  { id: "tx-explored-incongruence", group: "Therapist Response", label: "Therapist gently explored the experience of and potential functions of emotional incongruence." },
];
