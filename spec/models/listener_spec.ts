import { ModelChangeListener, ListenerContainer } from "models/listener";

class SimpleObject {
  doneCounter = 1;
  deleteCounter = 1;
}

describe("listener", () => {
  describe("container", () => {
    var instance: ListenerContainer<SimpleObject>;
    var listener: ModelChangeListener<SimpleObject>;
    var obj: SimpleObject;
    beforeEach(() => {
      instance = new ListenerContainer<SimpleObject>();
      obj = new SimpleObject();
      listener = {
        onDone: (o: SimpleObject) => o.doneCounter++,
        onDelete: (o: SimpleObject) => o.deleteCounter++,
      };
    });

    it("register", () => {
      instance.register(listener);
      expect(obj.doneCounter).toEqual(1);
      expect(obj.deleteCounter).toEqual(1);
    });

    it("done", () => {
      instance.register(listener);
      instance.add(obj);
      instance.done();
      expect(obj.doneCounter).toEqual(2);
      expect(obj.deleteCounter).toEqual(1);
    });

    it("add does not call callback method", () => {
      instance.register(listener);
      instance.add(obj);
      expect(obj.doneCounter).toEqual(1);
      expect(obj.deleteCounter).toEqual(1);
    });

    it("done does not effect un-related object", () => {
      instance.register(listener);
      instance.done();
      expect(obj.doneCounter).toEqual(1);
      expect(obj.deleteCounter).toEqual(1);
    });

    it("delete", () => {
      instance.register(listener);
      instance.add(obj);
      instance.done();
      instance.delete(obj);
      expect(obj.doneCounter).toEqual(2);
      expect(obj.deleteCounter).toEqual(2);
    });
  });
});
