---
title: "White-Labelling a Phoenix LiveView App with CSS Custom Properties"
description: How a semantic token layer, brand records in the database and a small plug let one set of components take on a new visual identity per customer.
date: "2026/03/23"
imageUrl: "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?q=80&w=3540&auto=format&fit=crop"
---

There have been several times throughout my career where I’m happily working away on SaaS code, when the inevitable question comes: “Can we white-label this?” All of a sudden, my carefully crafted component system, fine-tuned to match the initial designs I was handed, needs to be customisable per-customer. The potential sea of `if` statements is enough to send me spiralling.

Fortunately, it’s not the end of the world. There’s rework to be done, but, when implemented correctly, it’s possible to have a single approach that is flexible and extensible enough to give your components a fresh visual identity for each customer without needing any bespoke markup per brand.

This post walks through the approach I landed on: a semantic token layer in CSS, brand records in the database, and a component architecture that doesn't know or care which brand it's rendering for. The whole thing hinges on one idea: if your components only ever reference *semantic* CSS custom properties, you can re-theme the entire app by overriding those properties on the root element, without having to change any of your actual component code.

## CSS Properties Are Powerful

When working with a component-based web framework, such as Phoenix LiveView in this situation, your first instinct might be to pass a `brand` prop or assign to each of your components. You might then use this value to conditionally apply classes, perhaps with a tool like [CVA](https://cva.style), or with a bespoke helper function that combines a set of Tailwind classes into a brittle conglomeration of conditional strings. This results in conditional classes everywhere, components that know too much about the business domain, and a maintenance surface area that scales with every new brand that needs to be supported.

CSS custom properties sidestep all of that. Components reference tokens like `var(--color-brand)`. The actual colour values are injected once, inside a `<style>` tag in our base layout. These are structured as a `:root` CSS rule, ensuring overrides apply at the topmost level. The component layer never knows which brand it's rendering for, ensuring a clean separation of concerns.

## The Semantic Token Layer

The core decision behind this approach is to never let our component styles reference colours directly. Instead, we define two layers of custom properties.

The first is a Raw Design Token layer, which is our literal colour palette. In our case, this comes directly from a design system captured in Figma. They describe what the colour actually is:

```css
:root {
  --brand-primary-500: #2b4c7e;
  --brand-secondary-50: #f2f6fb;
  --gray-100: #e5e5e5;
  --gray-400: #737373;
}
```

The second layer is the Semantic Token Layer. This describes what each colour *does*, by referencing the raw tokens and giving them each a functional name. In Tailwind v4, these can go directly into the `@theme` block, which automatically exposes them as utility classes:

```css
@theme {
  --color-brand:              var(--brand-primary-500);
  --color-brand-secondary-50: var(--brand-secondary-50);
  --color-stroke-default:     var(--gray-100);
  --color-text-secondary:     var(--gray-400);
  --color-base-100:           oklch(100% 0 0);
  --color-base-content:       oklch(22.95% 0 0);
}
```

This gives us a stable set of names that our components can reference without concerning themselves with the actual colour values backing them.

## Writing Component Styles Against the Token Layer

Component styles only reference semantic tokens, not the underlying colour values. Here’s an example of a button component’s styles, using BEM-style CSS to match the conventions of the codebase I was working in:

```css
.btn--primary {
  background: var(--color-brand);
  color: var(--color-base-100);
}

.btn--secondary {
  background: var(--color-base-100);
  color: var(--color-brand);
  border-color: var(--color-brand);
}

.btn--ghost {
  color: var(--color-brand);
}

.btn--ghost:hover {
  background: var(--color-brand-secondary-50);
}

.btn:focus-visible {
  box-shadow: 0 0 4px 0 color-mix(in srgb, var(--color-brand) 80%, transparent);
}
```

Note that `var(--color-brand)` threads through every button variant; this means that overriding the base brand colour powering those semantic tokens effectively re-brands the entire component, without having to change the component code itself.

This is the part of the approach that pays off long-term for developers and customer base expansion. Every new component that you build will automatically support white-labelling, so long as it references these semantic tokens.

## Storing Brand Theme Information

Brand theme configurations live in a `brand_configs` table in our database. This is deliberately minimal, with a brand slug, a name, and a map of token overrides, stored in a `tokens` column in `jsonb` format. The map is keyed by the CSS variable name (without the `--` prefix), and valued with the actual CSS value to apply:

```elixir
%{
  "color-brand"              => "#7b2d8e",
  "color-brand-secondary-50" => "#f7f0f9",
  "color-primary"            => "oklch(35% 0.1 260)",
  "color-base-200"           => "oklch(97% 0.005 80)"
}
```

This structure means that the database stores exactly what our CSS needs, with no transformation layer between the stored config and the rendered output. The process for adding a new overridable token with this setup is to add it to your `@theme` block initially, and then to include it in the brand config mapping for brands that need to override that value. Brands that don’t override a token will fall back to the default component styling.

### Validating Token Keys

One thing that I also built into this approach to minimise future debugging headaches was to validate that the keys in a brand’s `tokens` map actually map to real semantic tokens. This can help avoid typos such as `color-brant` failing silently, or having to track down problems when a developer forgets to add the new mapping in the correct place.

I implemented this as a simple validation that checks keys against an allowlist at write time:

```elixir
@allowed_tokens MapSet.new([
  "color-base-100",
  "color-base-200",
  "color-base-content",
  "color-primary",
  "color-primary-content",
  "color-brand",
  "color-brand-secondary-50",
  "color-brand-secondary-100",
  "color-stroke-default",
  "color-text-secondary",
  # ... the full set of semantic tokens from your @theme block
])

def validate(changeset) do
  tokens = get_field(changeset, :tokens) || %{}
  unknown = Enum.reject(Map.keys(tokens), &(&1 in @allowed_tokens))

  case unknown do
    [] -> changeset
    keys -> add_error(changeset, :tokens, "unrecognised token keys: #{Enum.join(keys, ", ")}")
  end
end
```

The downside to this is that you do need to keep the allowlist in sync with your CSS, but given that it’s a single list in a single module, I feel it’s worth the tradeoff for the peace of mind knowing you have the validation check to catch silly mistakes.

## Resolving the Brand at Request Time

A dedicated plug resolves the brand early in the request lifecycle and converts it to a CSS string. The exact approach taken for this step may vary depending on your project’s tenancy model, but the output should always be a `:root` block that overrides the semantic tokens.

```elixir
defmodule MyAppWeb.BrandPlug do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    case resolve_brand_slug(conn) do
      nil ->
        assign(conn, :brand_style, nil)

      slug ->
        case MyApp.Branding.get_brand_by_slug(slug) do
          {:ok, config} -> assign(conn, :brand_style, to_css(config))
          _             -> assign(conn, :brand_style, nil)
        end
    end
  end

  defp resolve_brand_slug(conn) do
    # Swap this for your tenancy model — subdomain, session, etc.
    conn.params["brand"]
  end

  defp to_css(%{tokens: tokens}) do
    declarations = Enum.map_join(tokens, " ", fn {k, v} -> "--#{k}: #{v};" end)
    ":root { #{declarations} }"
  end
end
```

The `to_css` function transforms what we store in the database into what we need the browser to consume; it maps over the tokens, prefixes each with `--` and wraps the result in a `:root` CSS rule. This allows us to override branding tokens without templating, additional CSS file generation, or a build step.

## Injecting the Brand into the Root Layout

The root layout conditionally renders a `<style>` tag when a brand is active:

```elixir
<link phx-track-static rel="stylesheet" href={~p"/assets/css/app.css"} />
<style :if={@brand_style}>
  {@brand_style}
</style>
```

The inline style tag will override the `:root` custom properties provided in your base `app.css` file, and the semantic tokens pick up the new values. When there is no active brand in the session, `@brand_style` returns nil, and the style tag is not rendered, so the app falls back to the default brand colours and styling.

## Performance Implications

A reasonable concern with this approach is the performance implications of resolving a brand from the database on every request and injecting a dynamic style tag. In practice, this has been a non-issue.

Because the `<style>` tag lives in the `root.html.heex` layout, it’s only rendered once as part of the initial static HTML response. In Phoenix LiveView, the root layout sits outside of the LiveView socket lifecycle, so LiveView’s diffing algorithm never touches it. Subsequent in-app navigation re-renders the `app` layout, not the root layout, so the brand styles are only sent to the browser once per full page load. The plug itself also only runs once per HTTP request; once the web socket connection is established, the plug pipeline is no longer involved.

The actual CSS payload is also small enough to not be a concern. A brand with around ten token overrides produces a `:root` block of a few hundred bytes, inline with the `<head>`, with no additional network request required.

One recommendation for a full production app would be to cache the database lookup. Brand configs should, in theory, rarely change, so even a simple ETS cache or a library like Cachex will avoid querying the database on every full page load. Without caching, it’s a single indexed query on a `slug`, which isn’t a meaningful bottleneck unless you have very high traffic, but a simple caching approach is an easy enough win to have in place regardless.

## Why This Is My Preferred Approach to Branded Components

One question I’ve had from colleagues around this approach is whether it needs to be planned and baked from the very start of the project. Fortunately, this isn’t the case; the white-labelling infrastructure itself is a small amount of code that can be added to an existing app at any point. The real work, if you are retrofitting an existing app, is migrating your component styles to use named semantic tokens instead of hard-coded colour values. That said, this approach may be worth doing for reasons beyond white-labelling needs, depending on your project, as it gives you a single place to manage your colour palette and makes future design system changes much less painful to roll out.

In practice, migrating an existing application could also be done incrementally. You don’t need to convert every component in a single pass. You can start by defining your semantic tokens, begin using them in new work as features are developed, and migrate existing components as you touch them. The moment a component references `var(--color-brand)` instead of a hex value, it picks up brand overrides automatically, with no additional wiring required.

The biggest selling point of this approach, as a developer, is the lack of ongoing maintenance cost. We don’t need per-brand CSS files, build pipelines for generating theme variants, or feature flags to conditionally determine what our end users see.

Adding a new brand with this approach is a simple database record insert. This works particularly well if your system has an admin dashboard where customers can pick their own brand colours, as writing the new data is a simple form submission. This means no deployments required for onboarding new brands, and no direct changes to the code once the system is set up.

New components automatically get white-label support as they are added. So long as newly added components are developed to use the semantic tokens for styling, new brand colours will automatically flow through and apply as style overrides when provided in a brand’s theme configuration. As a developer, this is fantastic, because it means less manual maintenance of theme mappings compared to other approaches I have seen and used in the past.

By adding the validation helper, we can also catch drift in the naming system before it becomes a bigger problem. Renaming a semantic token in your CSS will cause the allowlist validation to reject any brand that references the old token name. By having an immediate and specific failure, we avoid this becoming a visual bug that could take days or weeks to discover in subtle styling cases.

## Gotchas and Limitations

While this approach handles colour theming well, there are some edge cases worth being aware of.

Colours are relatively easy, but logos, favicons, and fonts are harder. These can’t be expressed as CSS custom properties, so you’ll likely need a separate mechanism for them, such as asset references stored on the brand record and some conditional rendering in the root layout to swap them out.

The token allowlist also requires manual upkeep. When you add or rename a semantic token in your `@theme` block, you need to remember to update the validation list to match. This is a small maintenance cost, but forgetting it means new tokens can't be overridden by brands until someone notices. I've found it helps to keep the allowlist as close to the CSS as possible, with a comment pointing between the two so the link is obvious.

You'll also want to think about LiveView socket integration if you have components that need to render brand-dependent content dynamically. The plug sets `conn.assigns`, which covers the initial page load, but LiveView operates over a WebSocket after the initial connection. Carrying the brand through an `on_mount` hook ensures it's available in socket assigns for any live rendering that needs it.

Despite these edges, for the core use case of handling a white-labelled app that needs customisable colours per brand, this approach is relatively low-friction. Our components are completely unaware of the branding and business logic, our database stores exactly what our CSS needs, and onboarding a new brand requires no intervention from the developer, or even a deployment pipeline - simply a write to the database.
