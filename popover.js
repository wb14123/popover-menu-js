

class PopoverMenu extends HTMLElement {

    #self = this;

    static observedAttributes = [
        "placement", // which direction to open the pop over
        "middlewares", // floating ui middlewares, seperate by ,
        "open-event", // the event to trigger the open the pop over
        "open-delay", // the delay to open the pop over

        /*
        The event to trigger the close of pop over, in the format of "<event>:<target selector>". Default to "click:window".

        For example, if you want the popover to close when click on other places, you can set it to "click::root".
        Combined with "ignore-close-on-popover" and "ignore-close-on-button", the popover will only get close when
        the mouse is outside of content or button area.
        */
        "close-event",

        "close-delay", // the delay to close the pop over
        "close-mouse-on-button", // still close when mouse is on button
        "close-mouse-on-content", // still close when mouse is on content
    ];

    #contentDisplay;

    constructor() {
        super();
    }

    get buttonElement() {
        return this.querySelector("button");
    }

    get contentElement() {
        return this.querySelector("popover-content");
    }

    get placement() {
        return this.getAttribute("placement") || "top";
    }
    
    get middlewares() {
        return this.getAttribute("middlewares")?.split(",")?.map(s => s.trim()) || [];
    }


    get openEvent() {
        return this.getAttribute("open-event") || "click";
    }

    get openDelay() {
        return Number(this.getAttribute("open-delay") || "100");
    }

    get closeEvent() {
        return this.getAttribute("close-event")?.split(':')[0] || "click";
    }

    get closeDelay() {
        return Number(this.getAttribute("close-delay") || "100");
    }

    get closeEventTarget() {
        const parseArr = this.getAttribute("close-event")?.split(':');
        var elem;
        if (!parseArr?.length || parseArr.length < 2) {
            elem = ":root";
        } else {
            elem = parseArr[1];
        }
        return document.querySelector(elem);
    }


    get closeMouseOnButton() {
        return this.getAttribute("close-mouse-on-button") != null;
    }

    get closeMouseOnContent() {
        return this.getAttribute("close-mouse-on-content") != null;
    }

    #mouseInContent = false;
    #mouseInButton = false;

    closePopover() {
        this.contentElement.style.display = "none";
    }

    connectedCallback() {
        const self = this;

        self.#contentDisplay = self.contentElement.style.display;
        self.closePopover();

        self.buttonElement.addEventListener('mouseenter', event => {
            self.#mouseInButton = true;
        });
        self.buttonElement.addEventListener('mouseleave', event => {
            self.#mouseInButton = false;
        });
        self.contentElement.addEventListener('mouseenter', event => {
            self.#mouseInContent = true;
        });
        self.contentElement.addEventListener('mouseleave', event => {
            self.#mouseInContent = false;
        });



        self.buttonElement.addEventListener(self.openEvent, event => {
            if (event.type === self.openEvent) {
                setTimeout(() => {
                    self.contentElement.style.display = self.#contentDisplay;
                    self.contentElement.style.position = "absolute";
                    window.FloatingUIDOM.computePosition(self.buttonElement, self.contentElement, {
                        placement: self.placement,
                        middleware: self.middlewares,
                    }).then(({x, y}) => {
                        self.contentElement.style.left = `${x}px`;
                        self.contentElement.style.top = `${y}px`;
                    });
                }, self.openDelay);
            }
        });

        self.closeEventTarget?.addEventListener(self.closeEvent, event => {
            if (event.type === self.closeEvent) {
                setTimeout(() => {
                    if (!self.closeMouseOnContent && self.#mouseInContent) {
                        return;
                    }
                    if (!self.closeMouseOnButton && self.#mouseInButton) {
                        return;
                    }
                    self.closePopover();
                }, self.closeDelay);
            }
        });

    }

}

window.customElements.define("popover-menu", PopoverMenu);