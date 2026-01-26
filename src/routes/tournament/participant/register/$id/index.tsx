import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/tournament/participant/register/$id/')({
    params: {
        parse: (params) => {
            const id = Number(params.id);
            if (Number.isNaN(id)) throw new Error("Invalid tournament ID");
            return { id };
        },
        stringify: (params) => ({
            id: String(params.id),
        }),
    },
    beforeLoad: ({ params }) => {
        return {
            redirect: {
                to: '/tournament/participant/register/$id/create-participant',
                params,
            },
        };
    },
    component: RegisterLayout,

    context: () => ({
        participant: {
            firstName: '',
            lastName: '',
            age: null,
            rank: '',
            divisions: [],
        },
        setParticipant: () => { },
    }),
})


function RegisterLayout() {
  const { participant, setParticipant } = Route.useRouteContext();
    const { id } = Route.useParams();
  return (
    <div>
         {/* <Navigate
        to="/tournament/participant/register/$id/create-participant"
        params={{ id }}
      /> */}
      {/* <Stepper /> */}
      <Outlet />
    </div>
  );
}






// import { RegisterTournament } from '@/components/Participant/Register';
// import { createFileRoute } from '@tanstack/react-router'

// export const Route = createFileRoute('/tournament/participant/register/$id')({
//     params: {
//     parse: (params) => ({
//       id: Number(params.id),
//     }),
//     stringify: (params) => ({
//       id: String(params.id),
//     }),
//   },
//  component: RouteComponent,
// })

// function RouteComponent() {
//    const { id } = Route.useParams();
//    return <RegisterTournament tournamentId={id} />;  
// }
