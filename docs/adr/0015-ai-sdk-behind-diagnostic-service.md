# AI SDK Behind a Diagnostic Service

The app will use Vercel AI SDK as the initial provider-agnostic model abstraction, but AI calls must go through an application service such as a Diagnostic Model Service rather than being scattered across the codebase. This keeps model and provider selection configurable while preserving a stable domain boundary for Summarize Entity, Find Gaps, and Consistency Check.
