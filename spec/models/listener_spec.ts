import {
  TriggerContainer,
  EventTrigger,
  ModelListener,
  Tracker,
} from "models/listener";

enum EventType {
  CREATED,
  MODIFIED,
  DELETED,
}

class Simple1 {
  createdCounter = 0;
  modifiedCounter = 0;
  deletedCounter = 0;
}

class Simple2 {
  createdCounter = 0;
  modifiedCounter = 0;
  deletedCounter = 0;
}

describe("listener", () => {
  describe("tracker", () => {
    let subject: Simple1;

    beforeEach(() => {
      subject = new Simple1();
    });

    it("firing event invokes specific handler", () => {
      const tracker = new Tracker(subject);
      tracker.register((s) => s.modifiedCounter++);
      expect(subject.modifiedCounter).toEqual(0);
      tracker.fire();
      expect(subject.modifiedCounter).toEqual(1);
    });

    it("unregistered handler is not invoked", () => {
      const tracker = new Tracker(subject);
      tracker.register((s) => s.modifiedCounter++);
      tracker.fire();
      expect(subject.modifiedCounter).toEqual(1);
      tracker.unregisterAll();
      expect(subject.modifiedCounter).toEqual(1);
    });
  });

  describe("eventTrigger", () => {
    let subject1: Simple1;
    let createdTrigger: EventTrigger<Simple1>;
    let modifiedTrigger: EventTrigger<Simple1>;
    beforeEach(() => {
      subject1 = new Simple1();
      createdTrigger = new EventTrigger<Simple1>();
      createdTrigger.register((s) => s.createdCounter++);
      modifiedTrigger = new EventTrigger<Simple1>();
      modifiedTrigger.register((s) => s.modifiedCounter++);
    });

    it("observing subject does not trigger any event", () => {
      createdTrigger.add(subject1);
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
    });

    it("firing event causes object change", () => {
      createdTrigger.add(subject1);
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(0);
    });

    it("firing event delete subjects", () => {
      createdTrigger.add(subject1);
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(0);
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(0);
    });

    it("firing event causes multi object changes", () => {
      const subject1_2 = new Simple1();
      createdTrigger.add(subject1);
      createdTrigger.add(subject1_2);
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(0);
      expect(subject1_2.createdCounter).toEqual(1);
      expect(subject1_2.deletedCounter).toEqual(0);
    });

    it("firing event flushes queue", () => {
      createdTrigger.add(subject1);
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(1);
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(1);
    });

    it("firing specific object's event invokes tracker's handler", () => {
      const subject1_2 = new Simple1();
      const tracker = new Tracker(subject1);
      tracker.register((s) => s.modifiedCounter++);
      modifiedTrigger.add(subject1);
      modifiedTrigger.add(subject1_2);
      modifiedTrigger.track(tracker);
      modifiedTrigger.fire(subject1);
      expect(subject1.modifiedCounter).toEqual(2); // 共通ハンドラとトラッカーのハンドラの2回
      expect(subject1_2.modifiedCounter).toEqual(0);
      modifiedTrigger.fire(subject1);
      expect(subject1.modifiedCounter).toEqual(3); // トラッカーのハンドラのみ反応
    });

    it("firing event invokes tracker's handler via object", () => {
      const tracker = new Tracker(subject1);
      tracker.register((s) => s.modifiedCounter++);
      modifiedTrigger.track(tracker);
      modifiedTrigger.add(subject1);
      modifiedTrigger.fire();
      expect(subject1.modifiedCounter).toEqual(2); // 共通ハンドラとトラッカーのハンドラの2回
    });

    it("unobserved subject does not call handler", () => {
      createdTrigger.add(subject1);
      createdTrigger.flush();
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
    });

    it("handler does not invoked after unregistered", () => {
      createdTrigger.add(subject1);
      createdTrigger.unregisterAll();
      createdTrigger.fire();
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
    });
  });

  describe("triggerContainer", () => {
    let subject1: Simple1;
    let container: TriggerContainer<EventType, Simple1>;

    beforeEach(() => {
      subject1 = new Simple1();
      container = new TriggerContainer<EventType, Simple1>();
      const createT = container.find(EventType.CREATED);
      createT.register((s) => s.createdCounter++);
      const deleteT = container.find(EventType.DELETED);
      deleteT.register((s) => s.deletedCounter++);
      container.add(EventType.CREATED, subject1);
      container.add(EventType.DELETED, subject1);
    });

    it("register does not fire any event", () => {
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
    });

    it("firing event invokes matched event handler", () => {
      container.fire(EventType.CREATED);
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(0);

      container.fire(EventType.DELETED);
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(1);
    });

    it("firing specific object's event invokes tracker's handler", () => {
      const subject1_2 = new Simple1();
      const tracker = new Tracker(subject1);
      tracker.register((s) => s.modifiedCounter++);
      container.add(EventType.MODIFIED, subject1);
      container.track(EventType.MODIFIED, tracker);
      container.fire(EventType.MODIFIED, subject1);
      expect(subject1.modifiedCounter).toEqual(1);
      expect(subject1_2.modifiedCounter).toEqual(0);
    });

    it("firing event invokes tracker's handler via object", () => {
      const tracker = new Tracker(subject1);
      tracker.register((s) => s.modifiedCounter++);
      container.add(EventType.MODIFIED, subject1);
      container.track(EventType.MODIFIED, tracker);
      container.fire(EventType.MODIFIED);
      expect(subject1.modifiedCounter).toEqual(1);
    });

    it("flashed subject does not invoke event handler", () => {
      container.flush();
      container.fire(EventType.CREATED);
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
    });

    it("unregistered handler does not invoked", () => {
      container.unregisterAll();
      container.fire(EventType.CREATED);
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
    });
  });

  describe("modelListener", () => {
    let subject1: Simple1;
    let subject2: Simple2;
    let instance: ModelListener<EventType>;

    beforeEach(() => {
      instance = new ModelListener<EventType>();
      subject1 = new Simple1();
      subject2 = new Simple2();
      instance
        .find(EventType.CREATED, Simple1)
        .register((s) => s.createdCounter++);
      instance
        .find(EventType.DELETED, Simple1)
        .register((s) => s.deletedCounter++);
      instance
        .find(EventType.CREATED, Simple2)
        .register((s) => s.createdCounter++);
      instance
        .find(EventType.DELETED, Simple2)
        .register((s) => s.deletedCounter++);
      instance.add(EventType.CREATED, subject1);
      instance.add(EventType.DELETED, subject1);
      instance.add(EventType.CREATED, subject2);
      instance.add(EventType.DELETED, subject2);
    });

    it("registered handler is invoked matched event type", () => {
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
      expect(subject2.createdCounter).toEqual(0);
      expect(subject2.deletedCounter).toEqual(0);

      instance.fire(EventType.CREATED);
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(0);
      expect(subject2.createdCounter).toEqual(1);
      expect(subject2.deletedCounter).toEqual(0);

      instance.fire(EventType.DELETED);
      expect(subject1.createdCounter).toEqual(1);
      expect(subject1.deletedCounter).toEqual(1);
      expect(subject2.createdCounter).toEqual(1);
      expect(subject2.deletedCounter).toEqual(1);
    });

    it("unregistered handler is not invoked", () => {
      instance.unregisterAll();

      instance.fire(EventType.CREATED);
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
      expect(subject2.createdCounter).toEqual(0);
      expect(subject2.deletedCounter).toEqual(0);
    });

    it("flushed object deos not invoke any handler", () => {
      instance.flush();

      instance.fire(EventType.CREATED);
      expect(subject1.createdCounter).toEqual(0);
      expect(subject1.deletedCounter).toEqual(0);
      expect(subject2.createdCounter).toEqual(0);
      expect(subject2.deletedCounter).toEqual(0);
    });

    it("firing object event invokes specific object's handler via tracker", () => {
      const tracker = new Tracker(subject1);
      tracker.register((s) => s.modifiedCounter++);
      expect(subject1.modifiedCounter).toEqual(0);
      instance.track(EventType.MODIFIED, tracker);
      expect(subject1.modifiedCounter).toEqual(0);
      instance.fire(EventType.MODIFIED, subject1);
      expect(subject1.modifiedCounter).toEqual(1);
    });

    it("firing event invokes specific object's handler via tracker", () => {
      const tracker = new Tracker(subject1);
      tracker.register((s) => s.modifiedCounter++);
      expect(subject1.modifiedCounter).toEqual(0);
      instance.track(EventType.MODIFIED, tracker);
      expect(subject1.modifiedCounter).toEqual(0);
      instance.add(EventType.MODIFIED, subject1);
      expect(subject1.modifiedCounter).toEqual(0);
      instance.fire(EventType.MODIFIED);
      expect(subject1.modifiedCounter).toEqual(1);
    });
  });
});
