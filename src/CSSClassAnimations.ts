import { I_CSSClassAnimations, I_CSSClassAnimationsConstructorConfig, T_DOMEventsKeys, T_EmitterEventsKeys } from "./types";
import EventEmitter from "@xaro/event-emitter";
import _, { MicroDOM } from "@xaro/micro-dom";
import { events, eventsListeners } from "./variables";

export default class CSSClassAnimations implements I_CSSClassAnimations {
  els:      MicroDOM;
  emitter:  EventEmitter;
  allow:    T_DOMEventsKeys[];
  pending:  boolean = false;

  constructor(config: I_CSSClassAnimationsConstructorConfig) {
    this.emitter = new EventEmitter(config.on);

    this.els = Array.isArray(config.el) ? _(...config.el) : _(config.el);

    const allow     = config.allow;
    const disallow  = config.disallow;

    if (allow && allow.length > 0) {
      this.allow = (Array.isArray(allow) ? allow : [ allow ]).filter(value => events.includes(value.toLowerCase() as T_DOMEventsKeys));
    } else if (disallow && disallow.length > 0) {
      this.allow = (Array.isArray(disallow) ? disallow : [ disallow ]).filter(value => events.includes(value.toLowerCase() as T_DOMEventsKeys));
    } else {
      this.allow = events;
    }

    // if (config.allow) {
    //   this.allow = (Array.isArray(config.allow) ? config.allow : [ config.allow ]).filter(value => events.includes(value));
    // } else if (config.disallow && config.disallow.length > 0) {
    //   this.allow = (Array.isArray(config.disallow) ? config.disallow : [ config.disallow ]).filter(value => events.includes(value));
    // } else {
    //   this.allow = events;
    // }

    Object.keys(eventsListeners).forEach(key => this[eventsListeners[key]] = this[eventsListeners[key]].bind(this));

    this.els.forEach(el => this.allow.forEach(event => el.addEventListener(event, this[eventsListeners[event]])));
  }

  protected __mutationStartListener(event: AnimationEvent | TransitionEvent) {
    this.pending = true;
    this.emitter.emit('start', event);
  }

  protected __mutationCancelListener(event: AnimationEvent | TransitionEvent) {
    this.emitter.emit('cancel', event);
    this.pending = false;
  }

  protected __mutationEndListener(event: AnimationEvent | TransitionEvent) {
    this.emitter.emit('end', event);
    this.pending = false;
  }

  protected __mutationIterationListener(event: AnimationEvent | TransitionEvent) {
    this.emitter.emit('iteration', event);
  }

  protected __mutationRunListener(event: AnimationEvent | TransitionEvent) {
    this.pending = true;
    this.emitter.emit('run', event);
  }

  addEvent(domEventKey: T_DOMEventsKeys) {
    if (!events.includes(domEventKey)) {
      return;
    }
    
    this.allow.push(domEventKey);

    this.els.forEach(el => el.addEventListener(domEventKey, this[eventsListeners[domEventKey]]));
  }

  removeEvent(domEventKey: T_DOMEventsKeys) {
    if (!events.includes(domEventKey) || !this.allow.includes(domEventKey)) {
      return;
    }

    this.allow.splice(this.allow.indexOf(domEventKey));

    this.els.forEach(el => el.removeEventListener(domEventKey, this[eventsListeners[domEventKey]]));
  }

  on(eventKey: T_EmitterEventsKeys, cb: Function | Function[]) {
    this.emitter.subscribe(eventKey, cb);
  }
}