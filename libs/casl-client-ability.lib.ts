import {AbilityBuilder, Ability, RawRule} from '@casl/ability';

export const defineAbility = (permissions: RawRule[]) => {
    const {can, build} = new AbilityBuilder(Ability);

    permissions.forEach((permission) => {
        can(permission.action, permission.subject, permission.fields);
    });

    return build();
};
