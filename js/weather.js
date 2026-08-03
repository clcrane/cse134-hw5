class CurrentWeather extends HTMLElement {
    static get observedAttributes() {
        return ["latitude", "longitude"];
    }

    constructor() {
        super();
        this.controller = null;
    }

    connectedCallback() {
        this.loadWeather();
    }

    disconnectedCallback() {
        if (this.controller) {
            this.controller.abort();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.loadWeather();
        }
    }

    async loadWeather() {
        const latitude = this.getAttribute("latitude");
        const longitude = this.getAttribute("longitude");

        if (!latitude || !longitude) {
            this.setAttribute("data-state", "idle");
            return;
        }

        this.setAttribute("data-state", "loading");
        this.textContent = "Loading current weather...";

        if (this.controller) {
            this.controller.abort();
        }

        const controller = new AbortController();
        this.controller = controller;

        let timedOut = false;

        const timeoutId = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 8000);

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${encodeURIComponent(latitude)}` +
            `&longitude=${encodeURIComponent(longitude)}` +
            `&current=temperature_2m,weather_code`;

        try {
            const response = await fetch(url, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error("Weather request failed.");
            }

            const data = await response.json();

            clearTimeout(timeoutId);

            this.renderWeather(data);
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === "AbortError") {
                if (timedOut) {
                    this.renderError(
                        "The weather request took too long. Please try again."
                    );
                }

                return;
            }

            console.error(error);

            this.renderError("Unable to load weather right now.");
        }
    }

    renderWeather(data) {
        const template = document.querySelector("#weather-template");

        if (!template) {
            this.renderError("Unable to display weather data.");
            return;
        }

        const content = template.content.cloneNode(true);

        const temperatureElement =
            content.querySelector(".weather-temperature");

        const conditionElement =
            content.querySelector(".weather-condition");

        const temperature = data.current.temperature_2m;
        const weatherCode = data.current.weather_code;

        temperatureElement.textContent = `${temperature} °C`;
        conditionElement.textContent =
            this.getWeatherDescription(weatherCode);

        this.replaceChildren(content);
        this.setAttribute("data-state", "ready");
    }

    renderError(message) {
        this.setAttribute("data-state", "error");

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.textContent = "Try Again";

        retryButton.addEventListener("click", () => {
            this.loadWeather();
        });

        this.replaceChildren(paragraph, retryButton);
    }

    getWeatherDescription(code) {
        if (code === 0) {
            return "Clear sky";
        }

        if (code === 1 || code === 2 || code === 3) {
            return "Partly cloudy";
        }

        if (code === 45 || code === 48) {
            return "Foggy";
        }

        if (code >= 51 && code <= 67) {
            return "Rain or drizzle";
        }

        if (code >= 71 && code <= 77) {
            return "Snow";
        }

        if (code >= 80 && code <= 82) {
            return "Rain showers";
        }

        if (code >= 95) {
            return "Thunderstorm";
        }

        return "Unknown conditions";
    }
}

customElements.define("current-weather", CurrentWeather);