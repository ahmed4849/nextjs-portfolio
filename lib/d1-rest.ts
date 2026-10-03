type Parameter = string | number | null;
type Query = { sql: string; params: Parameter[] };
type Result<T = Record<string, unknown>> = {
  success: true;
  results: T[];
  meta: Record<string, unknown>;
};
type Configuration = {
  accountId: string;
  databaseId: string;
  apiToken: string;
};

// A server-side subset of the D1 binding used by this portfolio's fixed queries.
// The browser never receives this client, the token, or a general SQL endpoint.
export class D1RestDatabase {
  private endpoint: string;
  private token: string;
  private fetcher: typeof fetch;

  constructor(configuration: Configuration, fetcher: typeof fetch = fetch) {
    const { accountId, databaseId, apiToken } = configuration;
    if (
      !/^[a-f0-9]{32}$/i.test(accountId) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        databaseId,
      ) ||
      !apiToken
    )
      throw new Error("D1 environment variables are missing or invalid.");
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
    this.token = apiToken;
    this.fetcher = fetcher;
  }

  prepare(sql: string) {
    return new D1RestStatement(this, { sql, params: [] });
  }

  async batch(statements: D1RestStatement[]) {
    if (!statements.length) return [];
    if (statements.some((statement) => statement.database !== this))
      throw new Error("Statements must use the same database.");
    return this.query(statements.map((statement) => statement.query));
  }

  async query(queries: Query[]): Promise<Result[]> {
    const response = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(
        queries.length === 1 ? queries[0] : { batch: queries },
      ),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    // Never include Cloudflare response bodies or credentials in user errors/logs.
    if (!response.ok)
      throw new Error(`D1 request failed (${response.status}).`);
    const envelope = (await response.json()) as {
      success?: boolean;
      result?: Array<{
        success?: boolean;
        results?: Record<string, unknown>[];
        meta?: Record<string, unknown>;
      }>;
    };
    if (
      !envelope.success ||
      !Array.isArray(envelope.result) ||
      envelope.result.length !== queries.length ||
      envelope.result.some(
        (result) =>
          result.success !== true ||
          (result.results !== undefined && !Array.isArray(result.results)),
      )
    )
      throw new Error("D1 did not complete the database request.");
    return envelope.result.map((result) => ({
      success: true,
      results: result.results ?? [],
      meta: result.meta ?? {},
    }));
  }
}

class D1RestStatement {
  readonly database: D1RestDatabase;
  readonly query: Query;

  constructor(database: D1RestDatabase, query: Query) {
    this.database = database;
    this.query = query;
  }

  bind(...params: Parameter[]) {
    if (
      params.some(
        (value) => typeof value === "number" && !Number.isFinite(value),
      )
    )
      throw new Error("Invalid database parameter.");
    return new D1RestStatement(this.database, { sql: this.query.sql, params });
  }

  async all<T = Record<string, unknown>>() {
    const [result] = await this.database.query([this.query]);
    return result as Result<T>;
  }

  async first<T = Record<string, unknown>>() {
    const result = await this.all<T>();
    return result.results[0] ?? null;
  }

  async run() {
    return this.all();
  }
}
