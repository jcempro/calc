import type { LoadEvent, Listener, LoadOptions } from './ResourceLoader.types';

/**
 * Classe para carregamento genérico de recursos externos (JS, CSS, JSON, fontes, etc).
 */
class ResourceLoader {
  private static cache = new Set<string>(); // URLs já carregadas
  private static listeners: Listener[] = []; // Observadores globais
  private static defaultTimeout = 15000; // Timeout padrão 15s
  private static defaultRetries = 1;     // Tentativas padrão 1 (sem retry)

  /**
   * Registra listener para eventos de carregamento.
   * @param listener Callback para receber eventos
   */
  static onLoad(listener: Listener) {
    this.listeners.push(listener);
  }

  /**
   * Remove listener previamente registrado.
   * @param listener Callback a ser removido
   */
  static offLoad(listener: Listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notifica todos listeners sobre evento de carregamento.
   * @param event Dados do evento
   */
  private static notify(event: LoadEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  /**
   * Pré-carrega múltiplos recursos.
   * @param urls Array de URLs a carregar
   * @param options Opções opcionais para carregamento
   * @returns Promise resolvida quando todos forem carregados (ou falharem)
   */
  static preload(urls: string[], options?: LoadOptions): Promise<void[]> {
    const promises = urls.map(url =>
      this.load(url, options).then(() => undefined, () => undefined)
    );
    return Promise.all(promises);
  }

  /**
   * Carrega recurso externo conforme extensão.
   * @param url URL do recurso
   * @param options Opções opcionais de carregamento
   * @returns Promise com conteúdo carregado ou void
   */
  static async load<T = void>(url: string, options?: LoadOptions): Promise<T> {
    if (this.cache.has(url)) return Promise.resolve() as Promise<T>;

    if (options?.condition && !options.condition()) {
      return Promise.resolve() as Promise<T>;
    }

    const extension = url.split('.').pop()?.toLowerCase();

    const loadFn = () => {
      switch (extension) {
        case 'js': return this._loadScript(url);
        case 'css': return this._loadStyle(url);
        case 'json': return this._loadJson<T>(url);
        case 'woff':
        case 'woff2':
        case 'ttf': return this._loadFont(url);
        default: return this._loadGeneric(url);
      }
    };

    const timeoutMs = options?.timeoutMs ?? this.defaultTimeout;
    const retries = options?.retries ?? this.defaultRetries;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      const startTime = performance.now();
      try {
        const result = await Promise.race([
          loadFn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout ao carregar recurso: ${url}`)), timeoutMs)
          ),
        ]);
        const duration = performance.now() - startTime;
        this.cache.add(url);
        this.notify({ url, success: true, durationMs: duration });
        return result as T;
      } catch (err) {
        lastError = err as Error;
        this.notify({ url, success: false, error: lastError });
        if (attempt < retries) {
          console.warn(`Tentativa ${attempt} falhou para ${url}, tentando novamente...`);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    return Promise.reject(lastError);
  }

  /**
   * Carrega script JS e adiciona à página.
   * @param url URL do script
   * @returns Promise resolvida ao carregar
   */
  private static _loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Falha ao carregar script: ${url}`));

      document.head.appendChild(script);
    });
  }

  /**
   * Carrega CSS e adiciona à página.
   * @param url URL do CSS
   * @returns Promise resolvida ao carregar
   */
  private static _loadStyle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${url}"]`)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Falha ao carregar CSS: ${url}`));

      document.head.appendChild(link);
    });
  }

  /**
   * Carrega JSON via fetch.
   * @param url URL do JSON
   * @returns Promise resolvida com dados JSON
   */
  private static _loadJson<T>(url: string): Promise<T> {
    return fetch(url).then(res => {
      if (!res.ok) throw new Error(`Erro ao carregar JSON: ${res.statusText}`);
      return res.json() as Promise<T>;
    });
  }

  /**
   * Adiciona fonte ao documento via CSS @font-face.
   * @param url URL da fonte
   * @returns Promise resolvida ao adicionar
   */
  private static _loadFont(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const fontName = this._getFontNameFromUrl(url);
      if (!fontName) {
        reject(new Error('Nome da fonte não pôde ser extraído do URL'));
        return;
      }

      if (document.getElementById(`font-${fontName}`)) {
        resolve();
        return;
      }

      const style = document.createElement('style');
      style.id = `font-${fontName}`;
      style.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${url}') format('${this._getFontFormatFromExtension(url)}');
          font-weight: normal;
          font-style: normal;
        }
      `;

      document.head.appendChild(style);
      resolve();
    });
  }

  /**
   * Carrega recurso genérico via fetch e retorna texto.
   * @param url URL do recurso
   * @returns Promise resolvida com texto do recurso
   */
  private static _loadGeneric(url: string): Promise<string> {
    return fetch(url).then(res => {
      if (!res.ok) throw new Error(`Erro ao carregar recurso: ${res.statusText}`);
      return res.text();
    });
  }

  /**
   * Extrai nome da fonte do URL (ex: 'Roboto' de 'fonts/Roboto.woff2').
   * @param url URL da fonte
   * @returns Nome da fonte ou null
   */
  private static _getFontNameFromUrl(url: string): string | null {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    if (!filename) return null;
    return filename.split('.').slice(0, -1).join('.');
  }

  /**
   * Retorna o formato da fonte a partir da extensão do arquivo.
   * @param url URL da fonte
   * @returns Formato da fonte (ex: 'woff2', 'truetype')
   */
  private static _getFontFormatFromExtension(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'woff': return 'woff';
      case 'woff2': return 'woff2';
      case 'ttf': return 'truetype';
      default: return 'woff';
    }
  }
}

export default ResourceLoader;
