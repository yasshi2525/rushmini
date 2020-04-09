var _gen: g.RandomGenerator;

const random = {
    init: (gen: g.RandomGenerator) => {
        _gen = gen;
    },
    random: () => _gen
}

export default random;