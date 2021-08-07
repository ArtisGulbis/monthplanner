import { ErrorMessage, Field, Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import * as Yup from 'yup';
import { Day } from '../models/day';
import { Habit } from '../models/habit';
import { useStore } from '../stores/store';
import { checkAllCompletedHabits, checkCompletion } from '../utils/utils';
import AddHabitButton from './AddHabitButton';
import HabitEntry from './HabitEntry';

interface Props {
  day: Day;
  habits: Habit[];
}

const DayCard = ({ day, habits }: Props) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'habit',
    drop: (item: { name: string }) => {
      const habit: Habit = {
        completed: false,
        dayId: day.id,
        habitName: item.name,
        id: uuidv4(),
        missed: false,
      };
      createdHabitsStore.addHabit(habit.habitName);
      addHabit(day.id, habit);
      addToStats(habit);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const { dayStore, statisticsStore, monthStore, createdHabitsStore } =
    useStore();
  const { addHabit } = dayStore;
  const { addToStats } = statisticsStore;
  const { currentDay } = monthStore;

  const inputOutline = (color: string) => {
    return `text-${color}-900 placeholder-${color}-900 focus:outline-none focus:ring-2 focus:ring-${color}-600 focus:border-transparent`;
  };

  const dayCardMonthStyle = (color: string) => {
    return `border-r-2 border-${color}-400`;
  };

  const backgroundStyles = () => {
    if (checkAllCompletedHabits(day)) {
      return dayCardMonthStyle('green');
    } else if (day.dayNumber === currentDay) {
      return dayCardMonthStyle('pink');
    } else if (day.passed && checkAllCompletedHabits(day)) {
      return dayCardMonthStyle('green');
    } else if (day.passed) {
      return dayCardMonthStyle('blue');
    }
    return dayCardMonthStyle('yellow');
  };

  return (
    <div
      ref={!day.passed ? drop : undefined}
      className={`${
        isOver && 'filter brightness-110'
      } m-4 p-4 min-height card-container justify-between rounded-md shadow-lg ${checkCompletion(
        day,
        monthStore.currentDay,
        false
      )}`}
      id={`${day.dayNumber}`}
    >
      <div
        className={`${backgroundStyles()}  flex w-full flex-col items-center justify-center h-full pr-4`}
      >
        <h1 className="pt-2 pb-2 text-4xl filter drop-shadow font-sans">
          {day.weekDay}
        </h1>
        <h1 className="pt-2 pb-2 text-5xl font-sans">{day.dayNumber}</h1>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row flex-wrap mb-auto">
          {habits.map((el) => (
            <HabitEntry
              completed={checkAllCompletedHabits(day)}
              key={el.id}
              habit={el}
              passed={day.passed}
              dayNumber={day.dayNumber}
            />
          ))}
        </div>
        {!day.passed && (
          <Formik
            enableReinitialize={true}
            initialValues={{ habitName: '', error: '' }}
            onSubmit={(values, { resetForm }) => {
              const habit: Habit = {
                completed: false,
                dayId: day.id,
                habitName: values.habitName,
                id: uuidv4(),
                missed: false,
              };
              createdHabitsStore.addHabit(habit.habitName);
              addHabit(day.id, habit);
              addToStats(habit);
              resetForm();
            }}
            validationSchema={Yup.object({
              habitName: Yup.string().required('Please enter a Habit/Task'),
            })}
          >
            {({ handleSubmit }) => (
              <Form className="h-10 text-center self-center w-full flex mt-12 relative">
                <div className="absolute bottom-12 left-2 text-red-700">
                  <ErrorMessage name="habitName" />
                </div>
                <Field
                  name="habitName"
                  className={`h-full flex-grow overflow-visible z-30 ${
                    day.passed && 'rounded-md'
                  } w-1/2 text-center text-l font-light  ml-2 rounded-md
                  ${
                    checkAllCompletedHabits(day)
                      ? inputOutline('green')
                      : currentDay === day.dayNumber
                      ? inputOutline('pink')
                      : day.passed
                      ? inputOutline('blue')
                      : inputOutline('yellow')
                  }
                
                `}
                  placeholder="Enter Habit/Task..."
                />
                <AddHabitButton day={day} handleSubmit={handleSubmit} />
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default observer(DayCard);
