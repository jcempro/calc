type LoadEvent = {
	url: string;
	success: boolean;
	error?: Error;
	durationMs?: number;
};

type Listener = (event: LoadEvent) => void;

type LoadOptions = {
	timeoutMs?: number;
	retries?: number;
	condition?: () => boolean;
};

class ResourceLoader {
	private static cache = new Set<string>();
	private static listeners: Listener[] = [];
	private static defaultTimeout = 15000; // 15s
	private static defaultRetries = 1;

	static onLoad(listener: Listener) {
		this.listeners.push(listener);
	}

	static offLoad(listener: Listener) {
		this.listeners = this.listeners.filter((l) => l !== listener);
	}

	private static notify(event: LoadEvent) {
		this.listeners.forEach((listener) => listener(event));
	}

	static preload(urls: string[], options?: LoadOptions): Promise<void[]> {
		const promises = urls.map((url) =>
			this.load(url, options).then(
				() => undefined,
				() => undefined,
			),
		);
		return Promise.all(promises);
	}

	// Aqui a assinatura aceita só url ou url + options
	static async load<T = void>(url: string, options?: LoadOptions): Promise<T> {
		if (this.cache.has(url)) {
			return Promise.resolve() as Promise<T>;
		}

		if (options?.condition && !options.condition()) {
			return Promise.resolve() as Promise<T>;
		}

		const extension = url.split('.').pop()?.toLowerCase();

		const loadFn = () => {
			switch (extension) {
				case 'js':
					return this.loadScript(url);
				case 'css':
					return this.loadStyle(url);
				case 'json':
					return this.loadJson<T>(url);
				case 'woff':
				case 'woff2':
				case 'ttf':
					return this.loadFont(url);
				default:
					return this.loadGeneric(url);
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
						setTimeout(
							() => reject(new Error(`Timeout ao carregar recurso: ${url}`)),
							timeoutMs,
						),
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
					console.warn(
						`Tentativa ${attempt} falhou para ${url}, tentando novamente...`,
					);
					await new Promise((r) => setTimeout(r, 500));
				}
			}
		}

		return Promise.reject(lastError);
	}

	private static loadScript(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`script[src="${url}"]`)) {
				resolve();
				return;
			}

			const script = document.createElement('script');
			script.src = url;
			script.async = true;

			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error(`Falha ao carregar script: ${url}`));

			document.head.appendChild(script);
		});
	}

	private static loadStyle(url: string): Promise<void> {
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

	private static loadJson<T>(url: string): Promise<T> {
		return fetch(url).then((res) => {
			if (!res.ok) throw new Error(`Erro ao carregar JSON: ${res.statusText}`);
			return res.json() as Promise<T>;
		});
	}

	private static loadFont(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const fontName = this.getFontNameFromUrl(url);
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
          src: url('${url}') format('${this.getFontFormatFromExtension(url)}');
          font-weight: normal;
          font-style: normal;
        }
      `;

			document.head.appendChild(style);
			resolve();
		});
	}

	private static loadGeneric(url: string): Promise<string> {
		return fetch(url).then((res) => {
			if (!res.ok)
				throw new Error(`Erro ao carregar recurso: ${res.statusText}`);
			return res.text();
		});
	}

	private static getFontNameFromUrl(url: string): string | null {
		const parts = url.split('/');
		const filename = parts[parts.length - 1];
		if (!filename) return null;
		return filename.split('.').slice(0, -1).join('.');
	}

	private static getFontFormatFromExtension(url: string): string {
		const ext = url.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'woff':
				return 'woff';
			case 'woff2':
				return 'woff2';
			case 'ttf':
				return 'truetype';
			default:
				return 'woff';
		}
	}
}

export default ResourceLoader;
