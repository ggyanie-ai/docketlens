import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  DatasetJsonLd,
  ArticleJsonLd,
  HowToJsonLd,
} from "./structured-data";

/* ============================================================================
 *  Tests for the schema.org JSON-LD helpers.
 *
 *  Each helper emits exactly one <script type="application/ld+json"> tag
 *  whose body must be parseable JSON conforming to a specific schema.org
 *  shape. Crawlers + the Google Rich Results test are strict about both
 *  the field names and the @type taxonomy, so these are good candidates
 *  for regression cover.
 * ==========================================================================*/

/** Render the JSX, extract the inner JSON-LD payload, parse it. */
function payloadOf(node: React.ReactElement): Record<string, unknown> {
  const html = renderToStaticMarkup(node);
  const m = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!m) throw new Error("no JSON-LD script found in markup:\n" + html);
  return JSON.parse(m[1]) as Record<string, unknown>;
}

const SITE = "https://docketlens.ai";

describe("BreadcrumbJsonLd", () => {
  it("returns null for an empty items array", () => {
    const html = renderToStaticMarkup(<BreadcrumbJsonLd items={[]} />);
    expect(html).toBe("");
  });

  it("emits a BreadcrumbList with itemListElement[]", () => {
    const payload = payloadOf(
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: "Post", url: "/blog/post" },
        ]}
      />
    );
    expect(payload["@context"]).toBe("https://schema.org");
    expect(payload["@type"]).toBe("BreadcrumbList");
    const list = payload.itemListElement as Array<Record<string, unknown>>;
    expect(list).toHaveLength(3);
    expect(list[0].position).toBe(1);
    expect(list[1].position).toBe(2);
    expect(list[2].position).toBe(3);
    expect(list[0].name).toBe("Home");
    expect(list[2].item).toBe(`${SITE}/blog/post`);
  });

  it("joins relative URLs to SITE", () => {
    const payload = payloadOf(
      <BreadcrumbJsonLd items={[{ name: "X", url: "/x" }]} />
    );
    const list = payload.itemListElement as Array<Record<string, unknown>>;
    expect(list[0].item).toBe(`${SITE}/x`);
  });

  it("preserves absolute URLs as-is", () => {
    const payload = payloadOf(
      <BreadcrumbJsonLd
        items={[{ name: "External", url: "https://example.com/page" }]}
      />
    );
    const list = payload.itemListElement as Array<Record<string, unknown>>;
    expect(list[0].item).toBe("https://example.com/page");
  });
});

describe("OrganizationJsonLd", () => {
  it("emits Organization with required fields", () => {
    const payload = payloadOf(<OrganizationJsonLd />);
    expect(payload["@context"]).toBe("https://schema.org");
    expect(payload["@type"]).toBe("Organization");
    expect(payload.name).toBe("DocketLens");
    expect(payload.url).toBe(SITE);
    expect(payload.logo).toBe(`${SITE}/icon.png`);
    expect(payload.foundingDate).toBe("2026");
    expect(payload.email).toBe("support@docketlens.ai");
  });

  it("includes a contactPoint with customer-support type", () => {
    const payload = payloadOf(<OrganizationJsonLd />);
    const cp = payload.contactPoint as Array<Record<string, unknown>>;
    expect(cp[0]["@type"]).toBe("ContactPoint");
    expect(cp[0].contactType).toBe("customer support");
  });

  it("includes sameAs links (GitHub, X)", () => {
    const payload = payloadOf(<OrganizationJsonLd />);
    const sameAs = payload.sameAs as string[];
    expect(sameAs).toContain("https://github.com/donnowyu/docketlens");
    expect(sameAs).toContain("https://x.com/docketlens");
  });
});

describe("WebSiteJsonLd", () => {
  it("emits a WebSite with @id, name, url", () => {
    const payload = payloadOf(<WebSiteJsonLd />);
    expect(payload["@type"]).toBe("WebSite");
    expect(payload["@id"]).toBe(`${SITE}/#website`);
    expect(payload.name).toBe("DocketLens");
    expect(payload.url).toBe(SITE);
  });

  it("declares a SearchAction with literal {search_term_string} placeholder", () => {
    const payload = payloadOf(<WebSiteJsonLd />);
    const action = payload.potentialAction as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
    const target = action.target as Record<string, unknown>;
    expect(target["@type"]).toBe("EntryPoint");
    expect(target.urlTemplate).toBe(
      `${SITE}/search?q={search_term_string}`
    );
    expect(action["query-input"]).toBe("required name=search_term_string");
  });
});

describe("DatasetJsonLd", () => {
  it("emits a Dataset entity with correct creator + publisher", () => {
    const payload = payloadOf(<DatasetJsonLd />);
    expect(payload["@type"]).toBe("Dataset");
    expect(payload.name).toMatch(/DocketLens/);
    expect(payload.isAccessibleForFree).toBe(true);
    expect(payload.license).toBe(
      "https://creativecommons.org/publicdomain/zero/1.0/"
    );
    const creator = payload.creator as Record<string, unknown>;
    expect(creator["@type"]).toBe("Organization");
    expect(creator.name).toBe("Free Law Project");
    const publisher = payload.publisher as Record<string, unknown>;
    expect(publisher.name).toBe("DocketLens");
  });

  it("includes DataDownload distributions (JSON API + RSS)", () => {
    const payload = payloadOf(<DatasetJsonLd />);
    const dist = payload.distribution as Array<Record<string, unknown>>;
    expect(dist).toHaveLength(2);
    const formats = dist.map((d) => d.encodingFormat);
    expect(formats).toContain("application/json");
    expect(formats).toContain("application/rss+xml");
  });

  it("includes United States spatialCoverage and CourtListener+RECAP sameAs", () => {
    const payload = payloadOf(<DatasetJsonLd />);
    const sc = payload.spatialCoverage as Record<string, unknown>;
    expect(sc.name).toBe("United States");
    const sameAs = payload.sameAs as string[];
    expect(sameAs).toContain("https://www.courtlistener.com");
    expect(sameAs).toContain("https://free.law/recap/");
  });
});

describe("ArticleJsonLd", () => {
  const base = {
    headline: "How we ingest dockets",
    description: "A look at the pipeline.",
    url: "/blog/ingest",
    datePublished: "2026-05-20",
    authorName: "DocketLens Team",
    section: "Product",
  };

  it("emits NewsArticle for non-engineering section", () => {
    const payload = payloadOf(
      <ArticleJsonLd meta={{ ...base, section: "Product" }} />
    );
    expect(payload["@type"]).toBe("NewsArticle");
  });

  it("emits TechArticle for an 'Engineering' section (case-insensitive)", () => {
    const payload = payloadOf(
      <ArticleJsonLd meta={{ ...base, section: "Engineering" }} />
    );
    expect(payload["@type"]).toBe("TechArticle");
  });

  it("emits TechArticle for 'engineer' substring match", () => {
    const payload = payloadOf(
      <ArticleJsonLd meta={{ ...base, section: "engineering deep-dive" }} />
    );
    expect(payload["@type"]).toBe("TechArticle");
  });

  it("normalises datePublished from YYYY-MM-DD to RFC 3339", () => {
    const payload = payloadOf(<ArticleJsonLd meta={base} />);
    expect(payload.datePublished).toBe("2026-05-20T12:00:00Z");
  });

  it("preserves a full ISO datePublished as-is", () => {
    const payload = payloadOf(
      <ArticleJsonLd
        meta={{ ...base, datePublished: "2026-05-20T09:30:00Z" }}
      />
    );
    expect(payload.datePublished).toBe("2026-05-20T09:30:00Z");
  });

  it("defaults dateModified to datePublished when not provided", () => {
    const payload = payloadOf(<ArticleJsonLd meta={base} />);
    expect(payload.dateModified).toBe(payload.datePublished);
  });

  it("normalises dateModified independently when provided", () => {
    const payload = payloadOf(
      <ArticleJsonLd meta={{ ...base, dateModified: "2026-05-23" }} />
    );
    expect(payload.dateModified).toBe("2026-05-23T12:00:00Z");
  });

  it("joins relative urls to SITE; absolute pass through", () => {
    const payload1 = payloadOf(
      <ArticleJsonLd meta={{ ...base, url: "/blog/x" }} />
    );
    expect(payload1.url).toBe(`${SITE}/blog/x`);
    const payload2 = payloadOf(
      <ArticleJsonLd meta={{ ...base, url: "https://other.com/y" }} />
    );
    expect(payload2.url).toBe("https://other.com/y");
  });

  it("uses default opengraph-image when no image given", () => {
    const payload = payloadOf(<ArticleJsonLd meta={base} />);
    expect(payload.image).toBe(`${SITE}/opengraph-image`);
  });

  it("joins relative image to SITE", () => {
    const payload = payloadOf(
      <ArticleJsonLd meta={{ ...base, image: "/img/x.png" }} />
    );
    expect(payload.image).toBe(`${SITE}/img/x.png`);
  });

  it("preserves absolute image url", () => {
    const payload = payloadOf(
      <ArticleJsonLd
        meta={{ ...base, image: "https://cdn.example.com/x.png" }}
      />
    );
    expect(payload.image).toBe("https://cdn.example.com/x.png");
  });

  it("sets mainEntityOfPage @id to the resolved url", () => {
    const payload = payloadOf(<ArticleJsonLd meta={base} />);
    const meop = payload.mainEntityOfPage as Record<string, unknown>;
    expect(meop["@type"]).toBe("WebPage");
    expect(meop["@id"]).toBe(`${SITE}/blog/ingest`);
  });

  it("publishes under DocketLens publisher with logo", () => {
    const payload = payloadOf(<ArticleJsonLd meta={base} />);
    const pub = payload.publisher as Record<string, unknown>;
    expect(pub.name).toBe("DocketLens");
    const logo = pub.logo as Record<string, unknown>;
    expect(logo["@type"]).toBe("ImageObject");
    expect(logo.url).toBe(`${SITE}/icon.png`);
  });
});

describe("HowToJsonLd", () => {
  it("emits HowTo with name + description + steps", () => {
    const payload = payloadOf(
      <HowToJsonLd
        name="Verify a webhook"
        description="Step-by-step."
        pageUrl="/tools/verify-webhook"
        steps={[
          { name: "Paste secret", text: "Paste your signing secret." },
          { name: "Click verify", text: "Hit the verify button." },
        ]}
      />
    );
    expect(payload["@type"]).toBe("HowTo");
    expect(payload.name).toBe("Verify a webhook");
    expect(payload.description).toBe("Step-by-step.");
    const steps = payload.step as Array<Record<string, unknown>>;
    expect(steps).toHaveLength(2);
    expect(steps[0]["@type"]).toBe("HowToStep");
    expect(steps[0].position).toBe(1);
    expect(steps[1].position).toBe(2);
  });

  it("includes totalTime when totalTimeISO is provided", () => {
    const payload = payloadOf(
      <HowToJsonLd
        name="X"
        description="Y"
        pageUrl="/x"
        totalTimeISO="PT2M"
        steps={[{ name: "a", text: "b" }]}
      />
    );
    expect(payload.totalTime).toBe("PT2M");
  });

  it("anchors step urls onto the resolved pageUrl", () => {
    const payload = payloadOf(
      <HowToJsonLd
        name="X"
        description="Y"
        pageUrl="/tools/verify-webhook"
        steps={[
          { name: "a", text: "b", url: "#vw-secret" },
        ]}
      />
    );
    const steps = payload.step as Array<Record<string, unknown>>;
    expect(steps[0].url).toBe(`${SITE}/tools/verify-webhook#vw-secret`);
  });

  it("preserves absolute step urls", () => {
    const payload = payloadOf(
      <HowToJsonLd
        name="X"
        description="Y"
        pageUrl="/x"
        steps={[
          { name: "a", text: "b", url: "https://example.com/manual" },
        ]}
      />
    );
    const steps = payload.step as Array<Record<string, unknown>>;
    expect(steps[0].url).toBe("https://example.com/manual");
  });

  it("omits step.url when not provided", () => {
    const payload = payloadOf(
      <HowToJsonLd
        name="X"
        description="Y"
        pageUrl="/x"
        steps={[{ name: "a", text: "b" }]}
      />
    );
    const steps = payload.step as Array<Record<string, unknown>>;
    expect(steps[0].url).toBeUndefined();
  });
});
